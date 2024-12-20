import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true
  },
  category: String,  // e.g., "dairy", "meat", "vegetable"
  defaultUnit: String, // e.g., "g", "ml", "pieces"
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Add text index for search
ingredientSchema.index({ name: 'text' });

export const Ingredient = mongoose.models.Ingredient || mongoose.model('Ingredient', ingredientSchema); 