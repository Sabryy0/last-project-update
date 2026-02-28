const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const Unit = require("../models/unitModel");

//========================================================================================
// Create a new unit (Parent only)
exports.createUnit = catchAsync(async (req, res, next) => {
  const { unit_name, unit_type } = req.body;

  if (!unit_name || !unit_type) {
    return next(new AppError("Please provide unit_name and unit_type", 400));
  }

  // Check if unit already exists
  const existing = await Unit.findOne({ unit_name: unit_name.toLowerCase().trim() });
  if (existing) {
    return next(new AppError("This unit already exists", 400));
  }

  const unit = await Unit.create({
    unit_name: unit_name.toLowerCase().trim(),
    unit_type
  });

  res.status(201).json({
    status: "success",
    data: { unit }
  });
});

//========================================================================================
// Get all units
exports.getAllUnits = catchAsync(async (req, res, next) => {
  const { unit_type } = req.query;

  const filter = {};
  if (unit_type) filter.unit_type = unit_type;

  const units = await Unit.find(filter).sort({ unit_type: 1, unit_name: 1 });

  res.status(200).json({
    status: "success",
    results: units.length,
    data: { units }
  });
});

//========================================================================================
// Update a unit (Parent only)
exports.updateUnit = catchAsync(async (req, res, next) => {
  const { unitId } = req.params;
  const { unit_name, unit_type } = req.body;

  const unit = await Unit.findById(unitId);
  if (!unit) {
    return next(new AppError("Unit not found", 404));
  }

  if (unit_name) unit.unit_name = unit_name.toLowerCase().trim();
  if (unit_type) unit.unit_type = unit_type;

  await unit.save();

  res.status(200).json({
    status: "success",
    data: { unit }
  });
});

//========================================================================================
// Delete a unit (Parent only)
exports.deleteUnit = catchAsync(async (req, res, next) => {
  const { unitId } = req.params;

  const unit = await Unit.findById(unitId);
  if (!unit) {
    return next(new AppError("Unit not found", 404));
  }

  await Unit.findByIdAndDelete(unitId);

  res.status(204).json({
    status: "success",
    data: null
  });
});

//========================================================================================
// Seed default units
exports.seedUnits = catchAsync(async (req, res, next) => {
  const defaultUnits = [
    { unit_name: 'kg', unit_type: 'weight' },
    { unit_name: 'g', unit_type: 'weight' },
    { unit_name: 'mg', unit_type: 'weight' },
    { unit_name: 'lb', unit_type: 'weight' },
    { unit_name: 'oz', unit_type: 'weight' },
    { unit_name: 'liter', unit_type: 'volume' },
    { unit_name: 'ml', unit_type: 'volume' },
    { unit_name: 'cup', unit_type: 'volume' },
    { unit_name: 'tablespoon', unit_type: 'volume' },
    { unit_name: 'teaspoon', unit_type: 'volume' },
    { unit_name: 'piece', unit_type: 'count' },
    { unit_name: 'dozen', unit_type: 'count' },
    { unit_name: 'bunch', unit_type: 'count' },
    { unit_name: 'slice', unit_type: 'count' },
    { unit_name: 'can', unit_type: 'count' },
    { unit_name: 'bottle', unit_type: 'count' },
    { unit_name: 'packet', unit_type: 'count' },
    { unit_name: 'pinch', unit_type: 'count' },
  ];

  const created = [];
  const existing = [];

  for (const u of defaultUnits) {
    const exists = await Unit.findOne({ unit_name: u.unit_name });
    if (exists) {
      existing.push(u.unit_name);
    } else {
      await Unit.create(u);
      created.push(u.unit_name);
    }
  }

  res.status(200).json({
    status: "success",
    message: `Seeded ${created.length} units. ${existing.length} already existed.`,
    data: { created, existing }
  });
});
