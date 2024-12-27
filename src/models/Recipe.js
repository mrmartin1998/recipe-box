import mongoose from 'mongoose';

const ingredientSchema = new mongoose.Schema({
  item: {
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
  notes: String
});

const stepSchema = new mongoose.Schema({
  order: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  timer: Number // Optional timer in minutes
});

const recipeSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  name: {
    type: String,
    required: true
  },
  description: String,
  servings: {
    type: Number,
    required: true
  },
  prepTime: Number,  // in minutes
  cookTime: Number,  // in minutes
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    default: 'medium'
  },
  ingredients: [ingredientSchema],
  steps: [stepSchema],
  category: [String],
  image: String,
  isPublic: {
    type: Boolean,
    default: false
  },
  favorite: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Add indexes for better search performance
recipeSchema.index({ name: 'text', description: 'text' });

export const Recipe = mongoose.models.Recipe || mongoose.model('Recipe', recipeSchema); 