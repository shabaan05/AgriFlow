import crypto from 'crypto';
import mongoose from 'mongoose';

const blockSchema = new mongoose.Schema(
  {
    index: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now },
    eventType: {
      type: String,
      required: true,
      enum: [
        'HARVEST_CERTIFICATION',
        'PRODUCE_HANDOVER',
        'DELIVERY_CONFIRMATION',
        'PAYMENT_VERIFICATION'
      ]
    },
    payload: {
      cropId: { type: String, default: '' },
      cropName: { type: String, default: '' },
      orderId: { type: String, default: '' },
      farmerId: { type: String, default: '' },
      farmerName: { type: String, default: '' },
      buyerId: { type: String, default: '' },
      transporterId: { type: String, default: '' },
      quantityKg: { type: Number, default: 0 },
      qualityGrade: { type: String, default: '' },
      location: { type: String, default: '' },
      amountPaid: { type: Number, default: 0 },
      customNotes: { type: String, default: '' }
    },
    previousHash: { type: String, required: true },
    hash: { type: String, required: true },
    nonce: { type: Number, default: 0 }
  },
  { timestamps: true }
);

export const calculateHash = (index, timestamp, eventType, payload, previousHash, nonce) => {
  const data = `${index}${timestamp}${eventType}${JSON.stringify(payload)}${previousHash}${nonce}`;
  return crypto.createHash('sha256').update(data).digest('hex');
};

const BlockchainBlock = mongoose.model('BlockchainBlock', blockSchema);
export default BlockchainBlock;
