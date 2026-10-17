import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema(
  {
    cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop', required: true },
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    buyerName: { type: String, required: true },
    cropName: { type: String, required: true },
    bookedQuantityKg: { type: Number, required: true },
    agreedPricePerKg: { type: Number, required: true },
    totalAmount: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending_farmer_approval', 'confirmed', 'cancelled', 'converted_to_order'],
      default: 'confirmed'
    },
    advancePaymentAmount: { type: Number, default: 0 },
    expectedFulfillmentDate: { type: Date, required: true },
    notes: { type: String, default: 'Pre-harvest contract binding supply guarantee.' },
    blockchainHash: { type: String, default: '' }
  },
  { timestamps: true }
);

const Booking = mongoose.model('Booking', bookingSchema);
export default Booking;
