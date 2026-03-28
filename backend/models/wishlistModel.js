const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  member_mail: {
    type: String,
    required: [true, 'Please provide the member email'],
    ref: 'Member'
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  title: {
    type: String,
    default: 'My Wishlist'
  }
}, {
  timestamps: true
});

wishlistSchema.index({ member_mail: 1, family_id: 1 }, { unique: true });

const Wishlist = mongoose.model('Wishlist', wishlistSchema);

module.exports = Wishlist;
