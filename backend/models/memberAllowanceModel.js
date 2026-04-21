const mongoose = require('mongoose');

const memberAllowanceSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  period_budget_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PeriodBudget',
    default: null
  },
  member_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Member',
    default: null
  },
  member_mail: {
    type: String,
    required: [true, 'Please provide the member email'],
    ref: 'Member'
  },
  period_type: {
    type: String,
    enum: ['weekly', 'monthly', 'yearly', 'custom'],
    default: 'monthly'
  },
  start_date: {
    type: Date,
    default: null
  },
  end_date: {
    type: Date,
    default: null
  },
  allowance_currency: {
    type: String,
    enum: ['money'],
    default: 'money'
  },
  money_amount: {
    type: Number,
    default: 0,
    min: [0, 'Money amount cannot be negative']
  },
  spent_amount: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
  },
  last_activity_at: {
    type: Date,
    default: null
  },
  linked_point_wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointWallet',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

memberAllowanceSchema.index({ family_id: 1, member_mail: 1 });
memberAllowanceSchema.index({ family_id: 1, period_budget_id: 1, member_mail: 1 }, { unique: true, sparse: true });

memberAllowanceSchema.virtual('remaining_amount').get(function () {
  return Number(Math.max(0, Number(this.money_amount || 0) - Number(this.spent_amount || 0)).toFixed(2));
});

const MemberAllowance = mongoose.model('MemberAllowance', memberAllowanceSchema);

module.exports = MemberAllowance;