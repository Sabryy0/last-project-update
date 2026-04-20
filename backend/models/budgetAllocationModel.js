const mongoose = require('mongoose');

const budgetAllocationSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  period_budget_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PeriodBudget',
    required: [true, 'Please provide period_budget_id']
  },
  inventory_category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'InventoryCategory',
    required: [true, 'Please provide inventory_category_id']
  },
  allocated_amount: {
    type: Number,
    required: [true, 'Please provide allocated_amount'],
    min: [0, 'Allocated amount cannot be negative']
  },
  spent_amount: {
    type: Number,
    default: 0,
    min: [0, 'Spent amount cannot be negative']
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
  }
}, {
  timestamps: true
});

budgetAllocationSchema.index(
  { period_budget_id: 1, inventory_category_id: 1 },
  { unique: true }
);
budgetAllocationSchema.index({ family_id: 1, period_budget_id: 1 });

const BudgetAllocation = mongoose.models.BudgetAllocation || mongoose.model('BudgetAllocation', budgetAllocationSchema);

module.exports = BudgetAllocation;
