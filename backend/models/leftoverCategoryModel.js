const mongoose = require('mongoose');

const leftoverCategorySchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide the category title'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  }
});

// Unique category title per family
leftoverCategorySchema.index({ title: 1, family_id: 1 }, { unique: true });

const LeftoverCategory = mongoose.model('LeftoverCategory', leftoverCategorySchema);

module.exports = LeftoverCategory;
