const mongoose = require('mongoose');

const recipeStepSchema = new mongoose.Schema({
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Please provide the recipe ID']
  },
  step_number: {
    type: Number,
    required: [true, 'Please provide the step number'],
    min: [1, 'Step number must be at least 1']
  },
  instruction: {
    type: String,
    required: [true, 'Please provide the instruction']
  },
  duration: {
    type: Number,
    default: null,
    min: [0, 'Duration cannot be negative']
  }
});

// Compound index: step_number unique per recipe
recipeStepSchema.index({ recipe_id: 1, step_number: 1 }, { unique: true });

const RecipeStep = mongoose.model('RecipeStep', recipeStepSchema);

module.exports = RecipeStep;
