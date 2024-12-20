import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema({
  ingredient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Ingredient',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  unit: {
    type: String,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: String
});

const shoppingListSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  items: [shoppingItemSchema],
  fromRecipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  servings: Number,
  isArchived: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes
shoppingListSchema.index({ userId: 1 });
shoppingListSchema.index({ name: 'text' });

export const ShoppingList = mongoose.models.ShoppingList || mongoose.model('ShoppingList', shoppingListSchema); 