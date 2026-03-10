const mongoose = require('mongoose');

const groceryListSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'family_account',
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
    default: 'My Grocery List',
  },
  created_by: {
    type: String, // member email
    required: true,
  },
  color: {
    type: String,
    default: '#4CAF50',
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
  updated_at: {
    type: Date,
    default: Date.now,
  },
});

groceryListSchema.pre('save', function () {
  this.updated_at = Date.now();
});

const GroceryList = mongoose.model('grocery_list', groceryListSchema);
module.exports = GroceryList;
