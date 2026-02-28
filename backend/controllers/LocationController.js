const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const LocationShare = require("../models/locationShareModel");
const LocationPermission = require("../models/locationPermissionModel");
const Member = require("../models/MemberModel");
const MemberType = require("../models/MemberTypeModel");

//========================================================================================
// LOCATION SHARING
//========================================================================================

// Update my location
exports.updateLocation = catchAsync(async (req, res, next) => {
  const { latitude, longitude } = req.body;

  if (latitude === undefined || longitude === undefined) {
    return next(new AppError("Please provide latitude and longitude", 400));
  }

  // Upsert location share record
  const locationShare = await LocationShare.findOneAndUpdate(
    { member_mail: req.member.mail },
    {
      member_mail: req.member.mail,
      family_id: req.familyAccount._id,
      latitude,
      longitude,
      last_updated: Date.now(),
      is_sharing_enabled: true
    },
    { upsert: true, new: true }
  );

  res.status(200).json({
    status: "success",
    data: { location: locationShare }
  });
});

//========================================================================================
// Toggle my location sharing on/off
exports.toggleSharing = catchAsync(async (req, res, next) => {
  const { enabled } = req.body;

  if (enabled === undefined) {
    return next(new AppError("Please provide enabled (true/false)", 400));
  }

  const locationShare = await LocationShare.findOneAndUpdate(
    { member_mail: req.member.mail },
    { is_sharing_enabled: enabled },
    { new: true }
  );

  if (!locationShare) {
    return next(new AppError("No location record found. Please update your location first.", 404));
  }

  res.status(200).json({
    status: "success",
    message: `Location sharing ${enabled ? 'enabled' : 'disabled'}`,
    data: { location: locationShare }
  });
});

//========================================================================================
// Get my location
exports.getMyLocation = catchAsync(async (req, res, next) => {
  const location = await LocationShare.findOne({ member_mail: req.member.mail });

  res.status(200).json({
    status: "success",
    data: { location: location || null }
  });
});

//========================================================================================
// Get family members' locations (based on permissions)
exports.getFamilyLocations = catchAsync(async (req, res, next) => {
  const memberMail = req.member.mail;
  const familyId = req.familyAccount._id;

  // Check if requester is a Parent
  const memberType = await MemberType.findById(req.member.member_type_id);
  const isParent = memberType.type === 'Parent';

  let locations;

  if (isParent) {
    // Parents can see all family members who have sharing enabled
    locations = await LocationShare.find({
      family_id: familyId,
      is_sharing_enabled: true
    });
  } else {
    // Non-parents can only see members who approved their permission request
    const approvedPermissions = await LocationPermission.find({
      requester_mail: memberMail,
      family_id: familyId,
      permission_status: 'approved'
    });

    const approvedMails = approvedPermissions.map(p => p.target_mail);
    // Also include own location
    approvedMails.push(memberMail);

    locations = await LocationShare.find({
      member_mail: { $in: approvedMails },
      family_id: familyId,
      is_sharing_enabled: true
    });
  }

  // Enhance with member info
  const enrichedLocations = [];
  for (const loc of locations) {
    const member = await Member.findOne({ mail: loc.member_mail })
      .populate('member_type_id');
    enrichedLocations.push({
      ...loc.toObject(),
      member_username: member ? member.username : 'Unknown',
      member_type: member && member.member_type_id ? member.member_type_id.type : 'Unknown'
    });
  }

  res.status(200).json({
    status: "success",
    results: enrichedLocations.length,
    data: { locations: enrichedLocations }
  });
});

//========================================================================================
// LOCATION PERMISSIONS
//========================================================================================

// Request permission to view someone's location
exports.requestPermission = catchAsync(async (req, res, next) => {
  const { target_mail } = req.body;

  if (!target_mail) {
    return next(new AppError("Please provide target_mail", 400));
  }

  // Can't request to view own location
  if (target_mail === req.member.mail) {
    return next(new AppError("You cannot request permission to view your own location", 400));
  }

  // Verify target member is in the same family
  const targetMember = await Member.findOne({
    mail: target_mail,
    family_id: req.familyAccount._id
  });

  if (!targetMember) {
    return next(new AppError("Member not found in your family", 404));
  }

  // Check if permission already exists
  const existing = await LocationPermission.findOne({
    requester_mail: req.member.mail,
    target_mail,
    family_id: req.familyAccount._id
  });

  if (existing) {
    return res.status(200).json({
      status: "success",
      message: `Permission already ${existing.permission_status}`,
      data: { permission: existing }
    });
  }

  // If requester is a Parent and target is a child (non-Parent), auto-approve
  const requesterType = await MemberType.findById(req.member.member_type_id);
  const targetType = await MemberType.findById(targetMember.member_type_id);
  const autoApprove = requesterType.type === 'Parent' && targetType.type !== 'Parent';

  const permission = await LocationPermission.create({
    requester_mail: req.member.mail,
    target_mail,
    family_id: req.familyAccount._id,
    permission_status: autoApprove ? 'approved' : 'pending'
  });

  res.status(201).json({
    status: "success",
    message: autoApprove
      ? "Permission auto-approved (Parent viewing child)"
      : "Permission request sent. Waiting for approval.",
    data: { permission }
  });
});

//========================================================================================
// Respond to a permission request (approve/deny)
exports.respondPermission = catchAsync(async (req, res, next) => {
  const { permissionId } = req.params;
  const { status } = req.body; // 'approved' or 'denied'

  if (!status || !['approved', 'denied'].includes(status)) {
    return next(new AppError("Please provide status: 'approved' or 'denied'", 400));
  }

  const permission = await LocationPermission.findOne({
    _id: permissionId,
    target_mail: req.member.mail, // Only the target can respond
    family_id: req.familyAccount._id
  });

  if (!permission) {
    return next(new AppError("Permission request not found", 404));
  }

  if (permission.permission_status !== 'pending') {
    return next(new AppError(`Permission already ${permission.permission_status}`, 400));
  }

  permission.permission_status = status;
  await permission.save();

  res.status(200).json({
    status: "success",
    message: `Permission ${status}`,
    data: { permission }
  });
});

//========================================================================================
// Get my incoming permission requests (requests TO me)
exports.getMyPermissionRequests = catchAsync(async (req, res, next) => {
  const permissions = await LocationPermission.find({
    target_mail: req.member.mail,
    family_id: req.familyAccount._id
  }).sort({ requested_at: -1 });

  // Enrich with requester info
  const enriched = [];
  for (const perm of permissions) {
    const requester = await Member.findOne({ mail: perm.requester_mail });
    enriched.push({
      ...perm.toObject(),
      requester_username: requester ? requester.username : 'Unknown'
    });
  }

  res.status(200).json({
    status: "success",
    results: enriched.length,
    data: { permissions: enriched }
  });
});

//========================================================================================
// Get my outgoing permission requests (requests FROM me)
exports.getMyOutgoingRequests = catchAsync(async (req, res, next) => {
  const permissions = await LocationPermission.find({
    requester_mail: req.member.mail,
    family_id: req.familyAccount._id
  }).sort({ requested_at: -1 });

  // Enrich with target info
  const enriched = [];
  for (const perm of permissions) {
    const target = await Member.findOne({ mail: perm.target_mail });
    enriched.push({
      ...perm.toObject(),
      target_username: target ? target.username : 'Unknown'
    });
  }

  res.status(200).json({
    status: "success",
    results: enriched.length,
    data: { permissions: enriched }
  });
});

//========================================================================================
// Revoke a permission (by either party)
exports.revokePermission = catchAsync(async (req, res, next) => {
  const { permissionId } = req.params;

  const permission = await LocationPermission.findOne({
    _id: permissionId,
    family_id: req.familyAccount._id,
    $or: [
      { requester_mail: req.member.mail },
      { target_mail: req.member.mail }
    ]
  });

  if (!permission) {
    return next(new AppError("Permission not found", 404));
  }

  await LocationPermission.findByIdAndDelete(permissionId);

  res.status(204).json({
    status: "success",
    data: null
  });
});
