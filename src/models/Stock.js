import mongoose from 'mongoose';

const stockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 0
  },
  unit: {
    type: String,
    required: true
  },
  location: {
    type: String,
    default: 'Pantry'
  },
  expiryDate: Date,
  minimumQuantity: {
    type: Number,
    default: 0
  },
  notes: String
}, {
  timestamps: true
});

// Add indexes
stockSchema.index({ userId: 1, ingredient: 1 }, { unique: true });
stockSchema.index({ location: 1 });
stockSchema.index({ expiryDate: 1 });

export const Stock = mongoose.models.Stock || mongoose.model('Stock', stockSchema); 