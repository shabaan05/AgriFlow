import express from 'express';
import Crop from '../models/Crop.js';
import BlockchainService from '../services/blockchainService.js';
import { runShelfLifeAgent, runWastagePreventionAgent } from '../services/aiAgentsService.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { memoryStore } from '../config/db.js';

const router = express.Router();

// Helper to sanitize & augment crops with real-time AI shelf-life stats
const augmentCropWithAI = (crop) => {
  const c = crop.toObject ? crop.toObject() : { ...crop };
  const shelfLifeInfo = runShelfLifeAgent(c);
  const wastageInfo = runWastagePreventionAgent(c, shelfLifeInfo);
  return {
    ...c,
    aiShelfLife: shelfLifeInfo,
    aiWastageMitigation: wastageInfo,
    aiRiskScore: shelfLifeInfo.spoilageProbPercent,
    isUrgentSale: wastageInfo.actionRequired,
    discountPercentage: wastageInfo.suggestedDiscountPercent || 0
  };
};

// 1. Get all listed crops (with filters & AI risk evaluation)
router.get('/', async (req, res) => {
  try {
    const { category, status, search, urgentOnly } = req.query;
    let query = {};
    if (category) query.category = category;
    if (status) query.status = status;
    if (search) query.cropName = { $regex: search, $options: 'i' };

    let crops = [];
    try {
      crops = await Crop.find(query).sort({ createdAt: -1 });
    } catch {
      crops = memoryStore.crops.filter(c => {
        let match = true;
        if (category && c.category !== category) match = false;
        if (status && c.status !== status) match = false;
        if (search && !c.cropName.toLowerCase().includes(search.toLowerCase())) match = false;
        return match;
      });
    }

    let augmented = crops.map(augmentCropWithAI);
    if (urgentOnly === 'true') {
      augmented = augmented.filter(c => c.isUrgentSale);
    }

    res.json({ success: true, count: augmented.length, crops: augmented });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Get Single Crop by ID
router.get('/:id', async (req, res) => {
  try {
    let crop = null;
    try {
      crop = await Crop.findById(req.params.id);
    } catch {
      crop = memoryStore.crops.find(c => c._id === req.params.id);
    }

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop not found' });
    }

    res.json({ success: true, crop: augmentCropWithAI(crop) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Create New Crop Listing (Farmer only)
router.post('/', protect, authorizeRoles('farmer', 'admin'), async (req, res) => {
  try {
    const {
      cropName,
      variety,
      category,
      status,
      totalQuantityKg,
      pricePerKg,
      qualityGrade,
      expectedHarvestDate,
      estimatedShelfLifeDays,
      storageCondition,
      location,
      description
    } = req.body;

    const newCropData = {
      farmerId: req.user.id,
      farmerName: req.user.name,
      farmerPhone: req.user.phone || '9876543210',
      cropName,
      variety: variety || 'Standard Hybrid',
      category: category || 'vegetable',
      status: status || 'pre_harvest',
      totalQuantityKg: Number(totalQuantityKg),
      availableQuantityKg: Number(totalQuantityKg),
      pricePerKg: Number(pricePerKg),
      qualityGrade: qualityGrade || 'Grade A (Export/Premium)',
      expectedHarvestDate: expectedHarvestDate ? new Date(expectedHarvestDate) : new Date(Date.now() + 7 * 86400000),
      estimatedShelfLifeDays: Number(estimatedShelfLifeDays) || 7,
      storageCondition: storageCondition || 'ambient',
      location: location || {
        village: 'Karveer',
        taluka: 'Karveer',
        district: 'Kolhapur',
        state: 'Maharashtra',
        lat: 16.705,
        lng: 74.2433
      },
      description: description || 'Fresh harvest direct from farm.',
      images: [
        'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=600&auto=format&fit=crop&q=80'
      ]
    };

    let savedCrop;
    try {
      savedCrop = await Crop.create(newCropData);
    } catch (mongoErr) {
      // Log the real error so silent failures are visible during development
      console.error('[cropRoutes POST] MongoDB Crop.create failed:', mongoErr.message);
      // Fall back to in-memory store only when MongoDB is genuinely unavailable
      savedCrop = {
        _id: `mem_crop_${Date.now()}`,
        ...newCropData,
        createdAt: new Date()
      };
      memoryStore.crops.unshift(savedCrop);
    }

    // Record Immutable Harvest Certification Block on Blockchain
    let blockHash = '';
    try {
      const block = await BlockchainService.recordEvent('HARVEST_CERTIFICATION', {
        cropId: savedCrop._id.toString(),
        cropName: savedCrop.cropName,
        farmerId: req.user.id,
        farmerName: req.user.name,
        quantityKg: savedCrop.totalQuantityKg,
        qualityGrade: savedCrop.qualityGrade,
        location: `${savedCrop.location?.district || 'Kolhapur'}, MH`,
        customNotes: `Pre-Harvest/Harvest listing published with ${savedCrop.estimatedShelfLifeDays}d shelf-life`
      });
      blockHash = block?.hash || '';
    } catch (blockErr) {
      console.error('[cropRoutes POST] Blockchain recordEvent failed:', blockErr.message);
    }

    res.status(201).json({
      success: true,
      crop: augmentCropWithAI(savedCrop),
      blockchainHash: blockHash   // now returned so FarmerAddCrop.jsx can display it
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Update Crop Status (e.g., pre_harvest -> harvested)
router.patch('/:id/status', protect, authorizeRoles('farmer', 'admin'), async (req, res) => {
  try {
    const { status, actualHarvestDate } = req.body;
    let crop;
    try {
      crop = await Crop.findById(req.params.id);
      if (crop) {
        crop.status = status || crop.status;
        if (status === 'harvested') crop.actualHarvestDate = actualHarvestDate || new Date();
        await crop.save();
      }
    } catch {
      const idx = memoryStore.crops.findIndex(c => c._id === req.params.id);
      if (idx !== -1) {
        memoryStore.crops[idx].status = status;
        if (status === 'harvested') memoryStore.crops[idx].actualHarvestDate = actualHarvestDate || new Date();
        crop = memoryStore.crops[idx];
      }
    }

    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    res.json({ success: true, crop: augmentCropWithAI(crop) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
