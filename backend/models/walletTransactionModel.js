const mongoose = require('mongoose');

const walletTransactionSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  member_mail: {
    type: String,
    required: [true, 'Please provide the member email'],
    ref: 'Member'
  },
  member_wallet_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'MemberWallet',
    required: [true, 'Please provide the member wallet ID']
  },
  amount: {
    type: Number,
    required: [true, 'Please provide the transaction amount'],
    min: [0, 'Transaction amount cannot be negative']
  },
  transaction_type: {
    type: String,
    enum: ['deposit', 'withdrawal'],
    default: 'withdrawal'
  },
  description: {
    type: String,
    default: ''
  },
  transaction_date: {
    type: Date,
    default: Date.now
  },
  conversion_type: {
    type: String,
    enum: ['none', 'money_to_points', 'points_to_money'],
    default: 'none'
  },
  converted_amount: {
    type: Number,
    default: 0,
    min: [0, 'Converted amount cannot be negative']
  },
  conversion_rate: {
    type: Number,
    default: 0,
    min: [0, 'Conversion rate cannot be negative']
  },
  linked_point_transaction_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'PointHistory',
    default: null
  }
}, {
  timestamps: true
});

walletTransactionSchema.index({ family_id: 1, transaction_date: -1 });
walletTransactionSchema.index({ member_wallet_id: 1, transaction_date: -1 });
walletTransactionSchema.index({ conversion_type: 1 });

const WalletTransaction = mongoose.model('WalletTransaction', walletTransactionSchema);

module.exports = WalletTransaction;