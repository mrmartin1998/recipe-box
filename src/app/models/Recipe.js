const recipeSchema = new Schema({
  // ... other fields
  mealTypes: [{ type: String, enum: ['breakfast', 'lunch', 'dinner', 'snack'] }],
  // ...
}); 