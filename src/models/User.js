import mongoose from 'mongoose';

// Define the schema (structure and rules)
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  name: String,
  preferences: {
    measurementUnit: String,  // metric/imperial
    theme: String,
    notifications: {
      lowStock: Boolean,
      expiryWarning: Boolean
    }
  }
}, {
  timestamps: true  // This adds createdAt and updatedAt
});

// Create and export the model (database interface)
export const User = mongoose.models.User || mongoose.model('User', userSchema);