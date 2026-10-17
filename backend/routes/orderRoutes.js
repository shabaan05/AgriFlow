import express from 'express';
import Order from '../models/Order.js';
import Crop from '../models/Crop.js';
import Booking from '../models/Booking.js';
import BlockchainService from '../services/blockchainService.js';
import { runTransportOptimizationAgent } from '../services/aiAgentsService.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import { memoryStore } from '../config/db.js';

const router = express.Router();

// 1. Get Orders based on Role
router.get('/', protect, async (req, res) => {
  try {
    let orders = [];
    try {
      let query = {};
      if (req.user.role === 'farmer') {
        query = { farmerId: req.user.id };
      } else if (req.user.role === 'buyer') {
        query = { buyerId: req.user.id };
      } else if (req.user.role === 'transporter') {
        query = {
          $or: [
            { transporterId: req.user.id },
            { orderStatus: { $in: ['harvest_ready', 'placed', 'transporter_assigned', 'in_transit'] } }
          ]
        };
      }
      orders = await Order.find(query)
        .populate('buyerId', 'name email phone')
        .populate('farmerId', 'name email phone')
        .populate('transporterId', 'name email phone')
        .sort({ createdAt: -1 })
        .lean();
    } catch {
      orders = memoryStore.orders.filter(o => {
        if (req.user.role === 'farmer') return String(o.farmerId) === String(req.user.id);
        if (req.user.role === 'buyer') return String(o.buyerId) === String(req.user.id);
        if (req.user.role === 'transporter') return String(o.transporterId) === String(req.user.id) || ['harvest_ready', 'placed', 'transporter_assigned', 'in_transit'].includes(o.orderStatus);
        return true;
      });
    }

    // Normalize display fields for frontend consistency
    const normalizedOrders = orders.map(o => ({
      ...o,
      buyerName: o.buyerName || o.buyerId?.name || 'Buyer',
      farmerName: o.farmerName || o.farmerId?.name || 'Farmer',
      transporterName: o.transporterName || o.transporterId?.name || 'Transporter',
      blockchainHash: o.blockchainHash || o.blockchainTracking?.latestTxHash || ''
    }));

    res.json({ success: true, count: normalizedOrders.length, orders: normalizedOrders });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 2. Direct Buy / Instant Order Placement
router.post('/instant-buy', protect, authorizeRoles('buyer', 'admin'), async (req, res) => {
  try {
    const { cropId, quantityKg, deliveryLocation } = req.body;
    const qty = Number(quantityKg);

    // Business Logic Validation: positive quantity
    if (!qty || isNaN(qty) || qty <= 0) {
      return res.status(400).json({ success: false, message: 'Valid positive quantity required' });
    }

    let crop = null;
    try {
      crop = await Crop.findById(cropId);
    } catch {
      crop = memoryStore.crops.find(c => String(c._id) === String(cropId));
    }

    if (!crop) return res.status(404).json({ success: false, message: 'Crop not found' });
    if (crop.availableQuantityKg < qty) {
      return res.status(400).json({ success: false, message: 'Requested quantity exceeds stock' });
    }

    const orderNumber = `ORD-${Date.now().toString().slice(-6)}`;
    const effectivePrice = crop.isUrgentSale && crop.discountPercentage
      ? Math.round(crop.pricePerKg * (1 - crop.discountPercentage / 100))
      : crop.pricePerKg;
    const totalPrice = effectivePrice * qty;

    const orderPayload = {
      orderNumber,
      cropId: crop._id,
      buyerId: req.user.id,
      farmerId: crop.farmerId,
      buyerName: req.user.name || 'Buyer',
      farmerName: crop.farmerName || 'Farmer',
      transporterName: '',
      cropName: crop.cropName,
      quantityKg: qty,
      unitPrice: effectivePrice,
      totalPrice,
      orderStatus: crop.status === 'harvested' ? 'harvest_ready' : 'placed',
      paymentStatus: 'escrow_locked',
      blockchainHash: '',
      pickupLocation: {
        address: `${crop.location?.village || 'Karveer'}, ${crop.location?.district || 'Kolhapur'}`,
        city: crop.location?.district || 'Kolhapur',
        lat: crop.location?.lat || 16.705,
        lng: crop.location?.lng || 74.2433
      },
      deliveryLocation: deliveryLocation || {
        address: 'APMC Market Yard, Pune',
        city: 'Pune',
        lat: 18.5204,
        lng: 73.8567
      },
      digitalInvoice: {
        invoiceNumber: `INV-${orderNumber}`,
        issuedAt: new Date(),
        taxAmount: Math.round(totalPrice * 0.05),
        netAmount: Math.round(totalPrice * 1.05)
      },
      blockchainTracking: {
        eventsRecorded: ['PRODUCE_HANDOVER'],
        latestTxHash: ''
      }
    };

    let newOrder;
    try {
      newOrder = await Order.create(orderPayload);
      crop.availableQuantityKg -= qty;
      await crop.save();
    } catch {
      newOrder = { _id: `mem_ord_${Date.now()}`, ...orderPayload, createdAt: new Date() };
      memoryStore.orders.unshift(newOrder);
      crop.availableQuantityKg -= qty;
    }

    const block = await BlockchainService.recordEvent('PRODUCE_HANDOVER', {
      orderId: newOrder._id.toString(),
      orderNumber: newOrder.orderNumber,
      cropName: crop.cropName,
      buyerId: req.user.id,
      farmerId: crop.farmerId.toString(),
      quantityKg: qty,
      amountPaid: totalPrice,
      customNotes: `Order placed. Escrow locked at INR ${totalPrice}.`
    });

    if (newOrder.save) {
      newOrder.blockchainHash = block.hash;
      newOrder.blockchainTracking.latestTxHash = block.hash;
      await newOrder.save();
    } else {
      newOrder.blockchainHash = block.hash;
      newOrder.blockchainTracking.latestTxHash = block.hash;
    }

    res.status(201).json({ success: true, order: newOrder, blockchainTxHash: block.hash });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// State Machine Transition Matrix
const VALID_ORDER_TRANSITIONS = {
  placed: ['harvest_ready', 'transporter_assigned', 'cancelled'],
  harvest_ready: ['transporter_assigned', 'cancelled'],
  transporter_assigned: ['in_transit', 'cancelled'],
  in_transit: ['delivered', 'cancelled'],
  delivered: ['completed'],
  completed: [],
  cancelled: []
};

// 3. Update Order Status (Transporter accepts, in-transit, delivered)
router.patch('/:id/status', protect, async (req, res) => {
  try {
    const { orderStatus, proofOfDeliveryNotes } = req.body;
    let order = null;
    try {
      order = await Order.findById(req.params.id);
    } catch {
      order = memoryStore.orders.find(o => String(o._id) === String(req.params.id));
    }

    if (!order) return res.status(404).json({ success: false, message: 'Order not found' });

    // Validate Status Machine Transition
    if (orderStatus && orderStatus !== order.orderStatus) {
      const allowed = VALID_ORDER_TRANSITIONS[order.orderStatus] || [];
      if (!allowed.includes(orderStatus) && req.user.role !== 'admin') {
        return res.status(400).json({
          success: false,
          message: `Invalid status transition from '${order.orderStatus}' to '${orderStatus}'`
        });
      }
    }

    const prevStatus = order.orderStatus;
    const isNewDelivery = orderStatus === 'delivered' && prevStatus !== 'delivered';

    if (orderStatus) order.orderStatus = orderStatus;
    if (req.user.role === 'transporter') {
      order.transporterId = req.user.id;
      order.transporterName = req.user.name || 'Transporter';
    }
    if (proofOfDeliveryNotes) order.proofOfDeliveryNotes = proofOfDeliveryNotes;
    if (orderStatus === 'delivered') order.paymentStatus = 'released_to_farmer';

    if (order.save) {
      await order.save();
    }

    // Blockchain Event on Delivery (only on initial transition to delivered)
    if (isNewDelivery) {
      const block = await BlockchainService.recordEvent('DELIVERY_CONFIRMATION', {
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        buyerId: order.buyerId.toString(),
        farmerId: order.farmerId.toString(),
        transporterId: req.user.id,
        quantityKg: order.quantityKg,
        customNotes: `Produce successfully delivered to destination. Escrow payout unlocked to farmer.`
      });

      await BlockchainService.recordEvent('PAYMENT_VERIFICATION', {
        orderId: order._id.toString(),
        amountPaid: order.totalPrice,
        status: 'released_to_farmer',
        customNotes: `Full transaction amount INR ${order.totalPrice} settled to farmer.`
      });

      order.blockchainHash = block.hash;
      if (order.blockchainTracking) {
        order.blockchainTracking.eventsRecorded.push('DELIVERY_CONFIRMATION', 'PAYMENT_VERIFICATION');
        order.blockchainTracking.latestTxHash = block.hash;
      }
      if (order.save) {
        await order.save();
      }
    }

    res.json({ success: true, order });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// 4. Logistics Optimization Route Engine (Transporter Pickup Consolidator)
router.get('/transport-optimization', protect, async (req, res) => {
  try {
    let pendingOrders = [];
    try {
      pendingOrders = await Order.find({
        orderStatus: { $in: ['placed', 'harvest_ready', 'transporter_assigned'] }
      });
    } catch {
      pendingOrders = memoryStore.orders.filter(o => ['placed', 'harvest_ready', 'transporter_assigned'].includes(o.orderStatus));
    }

    const pickups = pendingOrders.map(o => ({
      orderId: o._id,
      orderNumber: o.orderNumber,
      cropName: o.cropName,
      quantityKg: o.quantityKg,
      city: o.pickupLocation?.city || 'Kolhapur',
      lat: o.pickupLocation?.lat || 16.705,
      lng: o.pickupLocation?.lng || 74.2433,
      destinationCity: o.deliveryLocation?.city || 'Pune'
    }));

    const plan = runTransportOptimizationAgent(pickups, 10000);
    res.json({ success: true, plan });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

export default router;
