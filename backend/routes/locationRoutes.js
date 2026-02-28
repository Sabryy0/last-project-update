const express = require('express');
const { protect } = require('../controllers/AuthController');
const {
  updateLocation,
  toggleSharing,
  getMyLocation,
  getFamilyLocations,
  requestPermission,
  respondPermission,
  getMyPermissionRequests,
  getMyOutgoingRequests,
  revokePermission
} = require('../controllers/LocationController');

const locationRouter = express.Router();

// All routes require authentication
locationRouter.use(protect);

// Location sharing
locationRouter.post('/update', updateLocation);
locationRouter.patch('/toggle', toggleSharing);
locationRouter.get('/me', getMyLocation);
locationRouter.get('/family', getFamilyLocations);

// Permissions
locationRouter.post('/permissions', requestPermission);
locationRouter.get('/permissions/incoming', getMyPermissionRequests);
locationRouter.get('/permissions/outgoing', getMyOutgoingRequests);
locationRouter.patch('/permissions/:permissionId', respondPermission);
locationRouter.delete('/permissions/:permissionId', revokePermission);

module.exports = locationRouter;
