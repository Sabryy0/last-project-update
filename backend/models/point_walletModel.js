const mongoose = require('mongoose');

const pointWalletSchema = new mongoose.Schema({
  member_mail: {
    type: String,
    required: [true, 'Please provide the member email']
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  total_points: {
    type: Number,
    default: 0,
    min: [0, 'Total points cannot be negative']
  },
  last_update: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

pointWalletSchema.index({ member_mail: 1, family_id: 1 }, { unique: true });

const PointWallet = mongoose.model('PointWallet', pointWalletSchema);

module.exports = PointWallet;
