const mongoose = require('mongoose');

const mealSuggestionSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  recipe_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Recipe',
    required: [true, 'Please provide the recipe ID']
  },
  match_percentage: {
    type: Number,
    required: [true, 'Please provide the match percentage'],
    min: 0,
    max: 100
  },
  missing_ingredients: [{
    ingredient_name: String,
    quantity: Number,
    unit_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Unit'
    }
  }],
  suggested_date: {
    type: Date,
    default: Date.now
  },
  uses_expiring_items: {
    type: Boolean,
    default: false
  },
  uses_leftovers: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Indexes
mealSuggestionSchema.index({ family_id: 1, createdAt: -1 });
mealSuggestionSchema.index({ match_percentage: -1 });

const MealSuggestion = mongoose.model('MealSuggestion', mealSuggestionSchema);

module.exports = MealSuggestion;
