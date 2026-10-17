import mongoose from 'mongoose';

const marketPriceSchema = new mongoose.Schema({
  state: String,
  district: String,
  market: String,
  commodity: String,
  variety: String,
  minPrice: Number,
  maxPrice: Number,
  modalPrice: Number,
  arrivalDate: Date
}, { timestamps: true });

const MarketPrice = mongoose.model("MarketPrice", marketPriceSchema);
export default MarketPrice;