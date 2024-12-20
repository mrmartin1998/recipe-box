import mongoose from 'mongoose';

// Define the schema (structure and rules)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  // ... rest of schema definition
});

// Create and export the model (database interface)
export const User = mongoose.models.User || mongoose.model('User', userSchema);