import express from 'express';
import Booking from '../models/Booking.js';
import Crop from '../models/Crop.js';
import BlockchainService from '../services/blockchainService.js';
import { runHarvestBookingAgent } from '../services/aiAgentsService.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { memoryStore } from '../config/db.js';

const router = express.Router();

// 1. Get all bookings (Farmer sees their received bookings, Buyer sees their made bookings)
router.get('/', protect, async (req, res) => {
  try {
    let bookings = [];
    try {
      if (req.user.role === 'farmer') {
        bookings = await Booking.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
      } else if (req.user.role === 'buyer') {
        bookings = await Booking.find({ buyerId: req.user.id }).sort({ createdAt: -1 });
      } else {
        bookings = await Booking.find().sort({ createdAt: -1 });
      }
    } catch {
      bookings = memoryStore.bookings.filter(b => {
        if (req.user.role === 'farmer') return b.farmerId === req.user.id;
        if (req.user.role === 'buyer') return b.buyerId === req.user.id;
        return true;
      });
    }

    res.json({ success: true, count: bookings.length, bookings });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Create Pre-Harvest Booking with AI Feasibility & Blockchain Hash
router.post('/', protect, authorizeRoles('buyer', 'admin'), async (req, res) => {
  try {
    const { cropId, bookedQuantityKg, desiredFulfillmentDate, notes } = req.body;
    const qty = Number(bookedQuantityKg);

    if (!cropId || !qty || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid cropId and bookedQuantityKg required' });
    }

    // Retrieve crop
    let crop = null;
    try {
      crop = await Crop.findById(cropId);
    } catch {
      crop = memoryStore.crops.find(c => c._id === cropId);
    }

    if (!crop) {
      return res.status(404).json({ success: false, message: 'Crop listing not found' });
    }

    if (crop.availableQuantityKg < qty) {
      return res.status(400).json({
        success: false,
        message: `Requested quantity exceeds available stock (${crop.availableQuantityKg} kg available)`
      });
    }

    // Run AI Harvest / Booking Agent
    const aiAnalysis = runHarvestBookingAgent(crop, qty, desiredFulfillmentDate);

    const unitPrice = crop.pricePerKg;
    const totalAmount = unitPrice * qty;

    const bookingPayload = {
      cropId: crop._id,
      farmerId: crop.farmerId,
      buyerId: req.user.id,
      buyerName: req.user.name,
      cropName: crop.cropName,
      bookedQuantityKg: qty,
      agreedPricePerKg: unitPrice,
      totalAmount,
      status: 'pending_farmer_approval',
      advancePaymentAmount: Math.round(totalAmount * 0.2), // 20% commitment advance
      expectedFulfillmentDate: desiredFulfillmentDate ? new Date(desiredFulfillmentDate) : crop.expectedHarvestDate,
      notes: notes || 'Pre-harvest contract binding supply guarantee.'
    };

    let newBooking;
    try {
      newBooking = await Booking.create(bookingPayload);
      crop.availableQuantityKg -= qty;
      await crop.save();
    } catch {
      newBooking = {
        _id: `mem_bk_${Date.now()}`,
        ...bookingPayload,
        createdAt: new Date()
      };
      memoryStore.bookings.unshift(newBooking);
      crop.availableQuantityKg -= qty;
    }

    // Blockchain Event: Pre-Harvest Supply Contract Handover Guarantee
    const block = await BlockchainService.recordEvent('PRODUCE_HANDOVER', {
      bookingId: newBooking._id.toString(),
      cropId: crop._id.toString(),
      cropName: crop.cropName,
      farmerId: crop.farmerId ? crop.farmerId.toString() : '',
      buyerId: req.user.id,
      quantityKg: qty,
      amountPaid: newBooking.advancePaymentAmount,
      customNotes: `Pre-harvest reservation registered. Pending farmer approval.`
    });

    if (newBooking.save) {
      newBooking.blockchainHash = block.hash;
      await newBooking.save();
    } else {
      newBooking.blockchainHash = block.hash;
    }

    res.status(201).json({
      success: true,
      booking: newBooking,
      aiAnalysis,
      blockchainTxHash: block.hash
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 3. Confirm Pre-Harvest Booking (Farmer approves forward contract)
router.patch('/:id/confirm', protect, authorizeRoles('farmer', 'admin'), async (req, res) => {
  try {
    const bookingId = req.params.id;
    let booking = null;

    try {
      booking = await Booking.findById(bookingId);
      if (booking) {
        booking.status = 'confirmed';
        await booking.save();
      }
    } catch {
      const idx = memoryStore.bookings.findIndex(b => b._id === bookingId);
      if (idx !== -1) {
        memoryStore.bookings[idx].status = 'confirmed';
        booking = memoryStore.bookings[idx];
      }
    }

    if (!booking) {
      return res.status(404).json({ success: false, message: 'Booking not found' });
    }

    // Record Immutable Contract Confirmation Block on Blockchain
    const block = await BlockchainService.recordEvent('PRODUCE_HANDOVER', {
      bookingId: booking._id.toString(),
      cropId: booking.cropId ? booking.cropId.toString() : '',
      cropName: booking.cropName,
      farmerId: booking.farmerId ? booking.farmerId.toString() : req.user.id,
      buyerId: booking.buyerId ? booking.buyerId.toString() : '',
      quantityKg: booking.bookedQuantityKg,
      amountPaid: booking.advancePaymentAmount,
      customNotes: `Pre-harvest forward contract confirmed by farmer. 20% advance locked in smart contract escrow.`
    });

    if (booking.save) {
      booking.blockchainHash = block.hash;
      await booking.save();
    } else {
      booking.blockchainHash = block.hash;
    }

    res.json({
      success: true,
      message: 'Booking agreement confirmed successfully.',
      booking,
      blockchainTxHash: block.hash
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
