const mongoose = require('mongoose');

const locationShareSchema = new mongoose.Schema({
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
  latitude: {
    type: Number,
    required: [true, 'Please provide latitude'],
    min: -90,
    max: 90
  },
  longitude: {
    type: Number,
    required: [true, 'Please provide longitude'],
    min: -180,
    max: 180
  },
  last_updated: {
    type: Date,
    default: Date.now
  },
  is_sharing_enabled: {
    type: Boolean,
    default: true
  }
});

// Indexes
locationShareSchema.index({ member_mail: 1, family_id: 1 }, { unique: true });
locationShareSchema.index({ family_id: 1 });

const LocationShare = mongoose.model('LocationShare', locationShareSchema);

module.exports = LocationShare;
