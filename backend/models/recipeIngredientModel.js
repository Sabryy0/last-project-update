const mongoose = require('mongoose');

const recipeIngredientSchema = new mongoose.Schema({
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Please provide the recipe ID']
  },
  ingredient_name: {
    type: String,
    required: [true, 'Please provide the ingredient name'],
    trim: true
  },
  quantity: {
    type: Number,
    required: [true, 'Please provide the quantity'],
    min: [0, 'Quantity cannot be negative']
  },
  unit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Please provide the unit']
  },
  notes: {
    type: String,
    default: ''
  }
});

// Index for faster lookups
recipeIngredientSchema.index({ recipe_id: 1 });

const RecipeIngredient = mongoose.model('RecipeIngredient', recipeIngredientSchema);

module.exports = RecipeIngredient;
