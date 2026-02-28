const mongoose = require('mongoose');

const mealItemSchema = new mongoose.Schema({
  meal_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Meal',
    required: [true, 'Please provide the meal ID']
  },
  inventory_item_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryItem',
    required: [true, 'Please provide the inventory item ID']
  },
  unit_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Unit',
    required: [true, 'Please provide the unit']
  },
  quantity_used: {
    type: Number,
    required: [true, 'Please provide the quantity used'],
    min: [0, 'Quantity used cannot be negative']
  }
});

// Index
mealItemSchema.index({ meal_id: 1 });
mealItemSchema.index({ inventory_item_id: 1 });

const MealItem = mongoose.model('MealItem', mealItemSchema);

module.exports = MealItem;
