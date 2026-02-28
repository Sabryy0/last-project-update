const mongoose = require('mongoose');

const locationPermissionSchema = new mongoose.Schema({
  requester_mail: {
    type: String,
    required: [true, 'Please provide the requester email'],
    ref: 'Member'
  },
  target_mail: {
    type: String,
    required: [true, 'Please provide the target email'],
    ref: 'Member'
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  },
  permission_status: {
    type: String,
    required: [true, 'Please provide the permission status'],
    enum: ['pending', 'approved', 'denied'],
    default: 'pending'
  },
  requested_at: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound index: one permission request per requester-target pair per family
locationPermissionSchema.index({ requester_mail: 1, target_mail: 1, family_id: 1 }, { unique: true });
locationPermissionSchema.index({ target_mail: 1, permission_status: 1 });

const LocationPermission = mongoose.model('LocationPermission', locationPermissionSchema);

module.exports = LocationPermission;
