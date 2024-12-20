import mongoose from 'mongoose';

const mealSchema = new mongoose.Schema({
  recipe: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe'
  },
  mealType: {
    type: String,
    enum: ['breakfast', 'lunch', 'dinner', 'snack'],
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  servings: {
    type: Number,
    required: true,
    min: 1
  },
  notes: String,
  skipMeal: {
    type: Boolean,
    default: false
  }
});

const mealPlanSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  meals: [mealSchema],
  notes: String
}, {
  timestamps: true
});

// Add indexes
mealPlanSchema.index({ userId: 1, startDate: 1, endDate: 1 });
mealPlanSchema.index({ 'meals.date': 1 });

export const MealPlan = mongoose.models.MealPlan || mongoose.model('MealPlan', mealPlanSchema); 