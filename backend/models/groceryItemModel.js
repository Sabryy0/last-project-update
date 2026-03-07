const mongoose = require('mongoose');

const groceryItemSchema = new mongoose.Schema({
  list_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'grocery_list',
    required: true,
  },
  item_name: {
    type: String,
    required: true,
    trim: true,
  },
  quantity: {
    type: Number,
    default: 1,
  },
  unit: {
    type: String,
    default: '',
    trim: true,
  },
  category: {
    type: String,
    default: 'Other',
    trim: true,
  },
  is_checked: {
    type: Boolean,
    default: false,
  },
  added_by: {
    type: String, // member email
  },
  created_at: {
    type: Date,
    default: Date.now,
  },
});

const GroceryItem = mongoose.model('grocery_item', groceryItemSchema);
module.exports = GroceryItem;
