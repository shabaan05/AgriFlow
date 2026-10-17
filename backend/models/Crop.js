import mongoose from 'mongoose';

const cropSchema = new mongoose.Schema(
  {
    farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    farmerName: { type: String, required: true },
    farmerPhone: { type: String, default: '' },
    cropName: { type: String, required: true }, // e.g. Tomato, Onion, Sugarcane, Soybean, Grapes
    variety: { type: String, default: 'Standard Hybrid' },
    category: {
      type: String,
      enum: ['vegetable', 'fruit', 'grain', 'cash_crop', 'pulses'],
      default: 'vegetable'
    },
    status: {
      type: String,
      enum: ['pre_harvest', 'harvested', 'sold', 'expired'],
      default: 'pre_harvest'
    },
    // Quantity details
    totalQuantityKg: { type: Number, required: true },
    availableQuantityKg: { type: Number, required: true },
    pricePerKg: { type: Number, required: true },
    qualityGrade: {
      type: String,
      enum: ['Grade A (Export/Premium)', 'Grade B (Standard Market)', 'Grade C (Processing)'],
      default: 'Grade A (Export/Premium)'
    },
    // Scheduling & Perishability
    expectedHarvestDate: { type: Date, required: true },
    actualHarvestDate: { type: Date },
    estimatedShelfLifeDays: { type: Number, default: 7 }, // Tomato: 7d, Onion: 60d, etc.
    storageCondition: {
      type: String,
      enum: ['ambient', 'cold_storage', 'ventilated_dry'],
      default: 'ambient'
    },
    location: {
      village: { type: String, default: '' },
      taluka: { type: String, default: 'Karveer' },
      district: { type: String, default: 'Kolhapur' },
      state: { type: String, default: 'Maharashtra' },
      lat: { type: Number, default: 16.705 },
      lng: { type: Number, default: 74.2433 }
    },
    description: { type: String, default: '' },
    images: [{ type: String }],
    // AI Decision Support Metrics
    aiRiskScore: { type: Number, default: 10 }, // 0 to 100 spoilage risk
    isUrgentSale: { type: Boolean, default: false },
    discountPercentage: { type: Number, default: 0 },
    demandIndexScore: { type: Number, default: 85 } // AI demand ranking
  },
  { timestamps: true }
);

const Crop = mongoose.model('Crop', cropSchema);
export default Crop;
