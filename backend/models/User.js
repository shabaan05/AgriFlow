import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ['farmer', 'buyer', 'transporter', 'admin'],
      required: true,
      default: 'farmer'
    },
    phone: { type: String, default: '' },
    location: {
      address: { type: String, default: '' },
      city: { type: String, default: 'Kolhapur' },
      state: { type: String, default: 'Maharashtra' },
      lat: { type: Number, default: 16.705 },
      lng: { type: Number, default: 74.2433 }
    },
    // Farmer specific details
    farmerProfile: {
      farmSizeAcres: { type: Number, default: 5 },
      preferredCrops: [{ type: String }],
      rating: { type: Number, default: 4.8 },
      totalDeliveredTons: { type: Number, default: 0 }
    },
    // Buyer specific details
    buyerProfile: {
      businessType: { type: String, default: 'Wholesale Distributor' }, // Retailer, Wholesaler, Processor, Exporter
      gstin: { type: String, default: '' },
      rating: { type: Number, default: 4.9 }
    },
    // Transporter specific details
    transporterProfile: {
      vehicleType: { type: String, default: 'Refrigerated Truck (10T)' },
      vehicleNumber: { type: String, default: 'MH-09-CV-4521' },
      maxCapacityKg: { type: Number, default: 10000 },
      currentLoadKg: { type: Number, default: 0 },
      isAvailable: { type: Boolean, default: true }
    },
    verified: { type: Boolean, default: true }
  },
  { timestamps: true }
);

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
