const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  member_mail: {
    type: String,
    required: [true, 'Please provide the creator email'],
    ref: 'Member'
  },
  recipe_name: {
    type: String,
    required: [true, 'Please provide the recipe name'],
    trim: true
  },
  category: {
    type: String,
    required: [true, 'Please provide the recipe category'],
    enum: ['Breakfast', 'Lunch', 'Dinner', 'Dessert', 'Snack', 'Appetizer', 'Main Course', 'Side Dish', 'Beverage', 'Other']
  },
  serving_size: {
    type: Number,
    required: [true, 'Please provide the serving size'],
    min: [1, 'Serving size must be at least 1']
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  }
}, {
  timestamps: true
});

// Indexes
recipeSchema.index({ member_mail: 1 });
recipeSchema.index({ family_id: 1, category: 1 });

const Recipe = mongoose.model('Recipe', recipeSchema);

module.exports = Recipe;
