const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const GroceryList = require("../models/groceryListModel");
const GroceryItem = require("../models/groceryItemModel");

//========================================================================================
// Get all grocery lists for the family
exports.getAllGroceryLists = catchAsync(async (req, res, next) => {
  const lists = await GroceryList.find({ family_id: req.familyAccount._id })
    .sort({ updated_at: -1 });

  // Get item counts for each list
  const listsWithCounts = await Promise.all(
    lists.map(async (list) => {
      const totalItems = await GroceryItem.countDocuments({ list_id: list._id });
      const checkedItems = await GroceryItem.countDocuments({ list_id: list._id, is_checked: true });
      return {
        ...list.toObject(),
        total_items: totalItems,
        checked_items: checkedItems,
      };
    })
  );

  res.status(200).json({
    status: "success",
    results: listsWithCounts.length,
    data: { lists: listsWithCounts },
  });
});

//========================================================================================
// Get a single grocery list with items
exports.getGroceryListById = catchAsync(async (req, res, next) => {
  const list = await GroceryList.findOne({
    _id: req.params.id,
    family_id: req.familyAccount._id,
  });

  if (!list) {
    return next(new AppError("Grocery list not found", 404));
  }

  const items = await GroceryItem.find({ list_id: list._id }).sort({ created_at: -1 });

  res.status(200).json({
    status: "success",
    data: {
      list,
      items,
    },
  });
});

//========================================================================================
// Create a new grocery list
exports.createGroceryList = catchAsync(async (req, res, next) => {
  const { title, color } = req.body;

  if (!title || title.trim() === "") {
    return next(new AppError("List title is required", 400));
  }

  const list = await GroceryList.create({
    family_id: req.familyAccount._id,
    title: title.trim(),
    created_by: req.member.mail,
    color: color || "#4CAF50",
  });

  res.status(201).json({
    status: "success",
    data: { list },
  });
});

//========================================================================================
// Update a grocery list
exports.updateGroceryList = catchAsync(async (req, res, next) => {
  const { title, color } = req.body;

  const list = await GroceryList.findOneAndUpdate(
    { _id: req.params.id, family_id: req.familyAccount._id },
    { title, color, updated_at: Date.now() },
    { new: true, runValidators: true }
  );

  if (!list) {
    return next(new AppError("Grocery list not found", 404));
  }

  res.status(200).json({
    status: "success",
    data: { list },
  });
});

//========================================================================================
// Delete a grocery list (and all its items)
exports.deleteGroceryList = catchAsync(async (req, res, next) => {
  const list = await GroceryList.findOneAndDelete({
    _id: req.params.id,
    family_id: req.familyAccount._id,
  });

  if (!list) {
    return next(new AppError("Grocery list not found", 404));
  }

  // Delete all items in this list
  await GroceryItem.deleteMany({ list_id: list._id });

  res.status(204).json({
    status: "success",
    data: null,
  });
});

//========================================================================================
// Add an item to a grocery list
exports.addGroceryItem = catchAsync(async (req, res, next) => {
  const { item_name, quantity, unit, category } = req.body;

  // Verify the list belongs to this family
  const list = await GroceryList.findOne({
    _id: req.params.id,
    family_id: req.familyAccount._id,
  });

  if (!list) {
    return next(new AppError("Grocery list not found", 404));
  }

  if (!item_name || item_name.trim() === "") {
    return next(new AppError("Item name is required", 400));
  }

  const item = await GroceryItem.create({
    list_id: list._id,
    item_name: item_name.trim(),
    quantity: quantity || 1,
    unit: unit || "",
    category: category || "Other",
    added_by: req.member.mail,
  });

  // Update list timestamp
  list.updated_at = Date.now();
  await list.save();

  res.status(201).json({
    status: "success",
    data: { item },
  });
});

//========================================================================================
// Update a grocery item (toggle check, rename, etc.)
exports.updateGroceryItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  const item = await GroceryItem.findById(itemId);
  if (!item) {
    return next(new AppError("Grocery item not found", 404));
  }

  // Verify list belongs to family
  const list = await GroceryList.findOne({
    _id: item.list_id,
    family_id: req.familyAccount._id,
  });

  if (!list) {
    return next(new AppError("Grocery list not found", 404));
  }

  const allowedFields = ["item_name", "quantity", "unit", "category", "is_checked"];
  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      item[field] = req.body[field];
    }
  });

  await item.save();

  // Update list timestamp
  list.updated_at = Date.now();
  await list.save();

  res.status(200).json({
    status: "success",
    data: { item },
  });
});

//========================================================================================
// Delete a grocery item
exports.deleteGroceryItem = catchAsync(async (req, res, next) => {
  const { itemId } = req.params;

  const item = await GroceryItem.findById(itemId);
  if (!item) {
    return next(new AppError("Grocery item not found", 404));
  }

  // Verify list belongs to family
  const list = await GroceryList.findOne({
    _id: item.list_id,
    family_id: req.familyAccount._id,
  });

  if (!list) {
    return next(new AppError("Grocery list not found", 404));
  }

  await GroceryItem.findByIdAndDelete(itemId);

  // Update list timestamp
  list.updated_at = Date.now();
  await list.save();

  res.status(204).json({
    status: "success",
    data: null,
  });
});
