const mongoose = require('mongoose');

const memberWalletSchema = new mongoose.Schema({
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  member_mail: {
    type: String,
    required: [true, 'Please provide the member email']
  },
  balance: {
    type: Number,
    default: 0,
    min: [0, 'Balance cannot be negative']
  },
  last_update: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

memberWalletSchema.index({ member_mail: 1, family_id: 1 }, { unique: true });

const MemberWallet = mongoose.models.MemberWallet || mongoose.model('MemberWallet', memberWalletSchema);

module.exports = MemberWallet;