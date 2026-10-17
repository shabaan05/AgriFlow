import express from 'express';
import Crop from '../models/Crop.js';
import Order from '../models/Order.js';
import BlockchainBlock from '../models/BlockchainBlock.js';
import BlockchainService from '../services/blockchainService.js';
import {
  runBuyerMatchAgent,
  runDemandForecastAgent,
  runShelfLifeAgent,
  runWastagePreventionAgent,
  runTransportOptimizationAgent
} from '../services/aiAgentsService.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { memoryStore } from '../config/db.js';

const router = express.Router();

// 1. AI Buyer Match Agent Endpoint
router.post('/match-crops', async (req, res) => {
  try {
    const { targetCropName, targetQuantity, maxPrice, buyerLat, buyerLng, preferredQuality } = req.body;

    let crops = [];
    try {
      crops = await Crop.find().lean();
    } catch {
      crops = memoryStore.crops;
    }

    const scoredResults = runBuyerMatchAgent(crops, {
      targetCropName,
      targetQuantity: Number(targetQuantity) || 100,
      maxPrice: Number(maxPrice) || Infinity,
      buyerLat: Number(buyerLat) || 16.705,
      buyerLng: Number(buyerLng) || 74.2433,
      preferredQuality
    });

    res.json({
      success: true,
      agentName: 'Buyer Match Agent',
      totalRanked: scoredResults.length,
      recommendations: scoredResults
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. AI Demand Forecast Agent Endpoint
router.get('/demand-forecast', async (req, res) => {
  try {
    const { cropName = 'Tomato', region = 'Kolhapur' } = req.query;
    const forecast = runDemandForecastAgent(cropName, region);
    res.json({ success: true, agentName: 'Demand Forecast Agent', forecast });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. AI Wastage Prevention & Shelf-Life Assessment (Batch scan across farm inventories)
router.get('/wastage-alerts', async (req, res) => {
  try {
    let crops = [];
    try {
      crops = await Crop.find().lean();
    } catch {
      crops = memoryStore.crops;
    }

    const alerts = [];
    crops.forEach(c => {
      const shelfInfo = runShelfLifeAgent(c);
      const wastage = runWastagePreventionAgent(c, shelfInfo);
      if (wastage.actionRequired) {
        alerts.push({
          cropId: c._id,
          cropName: c.cropName,
          farmerName: c.farmerName,
          availableQuantityKg: c.availableQuantityKg,
          location: c.location,
          daysRemaining: shelfInfo.daysRemaining,
          decayPercentage: shelfInfo.decayPercentage,
          riskTier: shelfInfo.riskTier,
          suggestedDiscountPercent: wastage.suggestedDiscountPercent,
          recommendedActions: wastage.recommendedActions
        });
      }
    });

    res.json({
      success: true,
      agentName: 'Shelf-Life & Wastage Prevention Agent',
      criticalAlertsCount: alerts.length,
      urgentProduce: alerts
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. AI Transport Optimization Plan
router.post('/optimize-transport', async (req, res) => {
  try {
    const { pickups = [], vehicleCapacityKg = 10000 } = req.body;
    const plan = runTransportOptimizationAgent(pickups, vehicleCapacityKg);
    res.json({ success: true, agentName: 'Transport Optimization Agent', plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 5. Blockchain Traceability Ledger & Cryptographic Integrity Check
router.get('/blockchain/ledger', async (req, res) => {
  try {
    const blocks = await BlockchainService.getAllBlocks();
    const integrity = await BlockchainService.verifyChainIntegrity();

    res.json({
      success: true,
      totalBlocks: blocks.length,
      chainIntegrity: integrity,
      blocks
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 6. Admin Overview Statistics & AI Governance
router.get('/admin-dashboard', protect, authorizeRoles('admin'), async (req, res) => {
  try {
    let totalCrops = 0;
    let totalOrders = 0;
    let totalVolumeTons = 0;
    let totalRevenue = 0;

    try {
      totalCrops = await Crop.countDocuments();
      totalOrders = await Order.countDocuments();
      const orders = await Order.find();
      totalVolumeTons = orders.reduce((sum, o) => sum + (o.quantityKg || 0), 0) / 1000;
      totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    } catch {
      totalCrops = memoryStore.crops.length;
      totalOrders = memoryStore.orders.length;
      totalVolumeTons = memoryStore.orders.reduce((sum, o) => sum + (o.quantityKg || 0), 0) / 1000;
      totalRevenue = memoryStore.orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    }

    const blocks = await BlockchainService.getAllBlocks();
    const integrity = await BlockchainService.verifyChainIntegrity();

    res.json({
      success: true,
      stats: {
        totalListedCrops: totalCrops,
        totalOrdersCount: totalOrders,
        totalVolumeTons: Number(totalVolumeTons.toFixed(2)),
        totalGrossMerchandiseValueINR: totalRevenue,
        blockchainBlocksMined: blocks.length,
        smartContractIntegrityStatus: integrity.valid ? 'Cryptographically Secure' : 'Compromised'
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
