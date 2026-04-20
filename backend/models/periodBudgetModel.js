const mongoose = require('mongoose');

const periodBudgetSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  title: {
    type: String,
    required: [true, 'Please provide a budget title'],
    trim: true
  },
  period_type: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', 'custom'],
    required: [true, 'Please provide period_type']
  },
  start_date: {
    type: Date,
    required: [true, 'Please provide start_date']
  },
  end_date: {
    type: Date,
    required: [true, 'Please provide end_date']
  },
  total_amount: {
    type: Number,
    required: [true, 'Please provide total_amount'],
    min: [0, 'Total amount cannot be negative']
  },
  spent_amount: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  currency: {
    type: String,
    default: 'EGP',
    trim: true
  },
  threshold_percentage: {
    type: Number,
    default: 15,
    min: [0, 'Threshold cannot be negative'],
    max: [100, 'Threshold cannot exceed 100']
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
  timestamps: true
});

periodBudgetSchema.index({ family_id: 1, start_date: 1, end_date: 1 });
periodBudgetSchema.index({ family_id: 1, is_active: 1 });

const PeriodBudget = mongoose.models.PeriodBudget || mongoose.model('PeriodBudget', periodBudgetSchema);

module.exports = PeriodBudget;
