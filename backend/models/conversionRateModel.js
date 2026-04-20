const mongoose = require('mongoose');

const conversionRateSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  money_to_points_rate: {
    type: Number,
    default: 10,
    min: [0, 'Money to points rate cannot be negative']
  },
  points_to_money_rate: {
    type: Number,
    default: 0.05,
    min: [0, 'Points to money rate cannot be negative']
  },
  is_active: {
    type: Boolean,
    default: true
  },
  created_by: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null
  }
}, {
  timestamps: {
    createdAt: 'created_at',
    updatedAt: 'updated_at'
  }
});

conversionRateSchema.index({ family_id: 1, is_active: 1 });

const ConversionRate = mongoose.model('ConversionRate', conversionRateSchema);

module.exports = ConversionRate;