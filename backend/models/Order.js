import mongoose from 'mongoose';

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, required: true, unique: true },
    cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Booking' },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    transporterId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    buyerName: { type: String, default: '' },
    farmerName: { type: String, default: '' },
    transporterName: { type: String, default: '' },
    blockchainHash: { type: String, default: '' },
    cropName: { type: String, required: true },
    quantityKg: { type: Number, required: true },
    unitPrice: { type: Number, required: true },
    totalPrice: { type: Number, required: true },
    orderStatus: {
      type: String,
      enum: [
        'placed',
        'harvest_ready',
        'transporter_assigned',
        'in_transit',
        'delivered',
        'completed',
        'cancelled'
      ],
      default: 'placed'
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'escrow_locked', 'released_to_farmer', 'refunded'],
      default: 'escrow_locked'
    },
    pickupLocation: {
      address: { type: String, default: '' },
      city: { type: String, default: 'Kolhapur' },
      lat: { type: Number, default: 16.705 },
      lng: { type: Number, default: 74.2433 }
    },
    deliveryLocation: {
      address: { type: String, default: '' },
      city: { type: String, default: 'Pune' },
      lat: { type: Number, default: 18.5204 },
      lng: { type: Number, default: 73.8567 }
    },
    transportTripId: { type: String, default: '' },
    proofOfDeliveryNotes: { type: String, default: '' },
    digitalInvoice: {
      invoiceNumber: { type: String, default: '' },
      issuedAt: { type: Date, default: Date.now },
      taxAmount: { type: Number, default: 0 },
      netAmount: { type: Number, default: 0 }
    },
    blockchainTracking: {
      eventsRecorded: [{ type: String }],
      latestTxHash: { type: String, default: '' }
    }
  },
  { timestamps: true }
);

const Order = mongoose.model('Order', orderSchema);
export default Order;
