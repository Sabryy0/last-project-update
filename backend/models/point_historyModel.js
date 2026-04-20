const mongoose = require('mongoose');

const pointHistorySchema = new mongoose.Schema({
  wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointWallet',
    required: [true, 'Please provide the wallet ID']
  },
  member_mail: {
    type: String,
    required: [true, 'Please provide the member email']
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  points_amount: {
    type: Number,
    required: [true, 'Please provide the points amount']
  },
  reason_type: {
    type: String,
    required: [true, 'Please provide the reason type'],
    enum: ['task_completion', 'penalty', 'redeem', 'bonus', 'adjustment', 'manual_grant', 'conversion']
  },
  task_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Task',
    default: null
  },
  redeem_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Redeem',
    default: null
  },
  granted_by: {
    type: String,
    required: [true, 'Please provide who granted the points']
  },
  description: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Indexes for faster queries
pointHistorySchema.index({ wallet_id: 1, createdAt: -1 });
pointHistorySchema.index({ member_mail: 1, family_id: 1, createdAt: -1 });
pointHistorySchema.index({ granted_by: 1 });

const PointHistory = mongoose.models.PointHistory || mongoose.model('PointHistory', pointHistorySchema);

module.exports = PointHistory;
