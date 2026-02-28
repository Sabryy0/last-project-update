const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const MealSuggestion = require("../models/mealSuggestionModel");
const Recipe = require("../models/recipeModel");
const RecipeIngredient = require("../models/recipeIngredientModel");
const Inventory = require("../models/inventoryModel");
const InventoryItem = require("../models/inventoryItemModel");
const Leftover = require("../models/leftoverModel");

//========================================================================================
// Generate meal suggestions based on available inventory and leftovers
exports.generateSuggestions = catchAsync(async (req, res, next) => {
  const familyId = req.familyAccount._id;
  const MIN_MATCH_PERCENTAGE = 70;

  // Step 1: Get all family inventory items
  const inventories = await Inventory.find({ family_id: familyId });
  const inventoryIds = inventories.map(inv => inv._id);
  const inventoryItems = await InventoryItem.find({
    inventory_id: { $in: inventoryIds },
    quantity: { $gt: 0 }
  }).populate('unit_id');

  // Step 2: Get all non-expired leftovers
  const leftovers = await Leftover.find({
    family_id: familyId,
    expiry_date: { $gte: new Date() },
    quantity: { $gt: 0 }
  }).populate('unit_id');

  // Step 3: Build available items map (name lowercase -> { quantity, unit, source })
  const availableItems = new Map();

  for (const item of inventoryItems) {
    const key = item.item_name.toLowerCase();
    if (availableItems.has(key)) {
      const existing = availableItems.get(key);
      if (existing.unit_id.toString() === item.unit_id._id.toString()) {
        existing.quantity += item.quantity;
      }
    } else {
      availableItems.set(key, {
        quantity: item.quantity,
        unit_id: item.unit_id._id.toString(),
        unit_name: item.unit_id.unit_name,
        source: 'inventory',
        expiring: item.expiry_date && item.expiry_date <= new Date(Date.now() + 3 * 24 * 60 * 60 * 1000)
      });
    }
  }

  // Add leftovers to available items
  for (const leftover of leftovers) {
    const key = leftover.item_name.toLowerCase();
    if (availableItems.has(key)) {
      const existing = availableItems.get(key);
      if (existing.unit_id === leftover.unit_id._id.toString()) {
        existing.quantity += leftover.quantity;
        existing.source = 'both';
        existing.has_leftover = true;
      }
    } else {
      availableItems.set(key, {
        quantity: leftover.quantity,
        unit_id: leftover.unit_id._id.toString(),
        unit_name: leftover.unit_id.unit_name,
        source: 'leftover',
        has_leftover: true,
        expiring: leftover.expiry_date <= new Date(Date.now() + 24 * 60 * 60 * 1000)
      });
    }
  }

  // Step 4: Get all family recipes
  const recipes = await Recipe.find({ family_id: familyId });

  // Step 5: Calculate match for each recipe
  const suggestions = [];

  for (const recipe of recipes) {
    const ingredients = await RecipeIngredient.find({ recipe_id: recipe._id })
      .populate('unit_id');

    if (ingredients.length === 0) continue;

    let matched = 0;
    let usesExpiringItems = false;
    let usesLeftovers = false;
    const missingIngredients = [];

    for (const ingredient of ingredients) {
      const key = ingredient.ingredient_name.toLowerCase();
      const available = availableItems.get(key);

      if (available && available.unit_id === ingredient.unit_id._id.toString() && available.quantity >= ingredient.quantity) {
        matched++;
        if (available.expiring) usesExpiringItems = true;
        if (available.has_leftover) usesLeftovers = true;
      } else {
        missingIngredients.push({
          ingredient_name: ingredient.ingredient_name,
          quantity: ingredient.quantity,
          unit_id: ingredient.unit_id._id
        });
      }
    }

    const matchPercentage = Math.round((matched / ingredients.length) * 100);

    if (matchPercentage >= MIN_MATCH_PERCENTAGE) {
      suggestions.push({
        recipe,
        match_percentage: matchPercentage,
        missing_ingredients: missingIngredients,
        uses_expiring_items: usesExpiringItems,
        uses_leftovers: usesLeftovers
      });
    }
  }

  // Step 6: Sort by priority (expiring items first, then leftovers, then match %)
  suggestions.sort((a, b) => {
    if (a.uses_expiring_items !== b.uses_expiring_items) return b.uses_expiring_items - a.uses_expiring_items;
    if (a.uses_leftovers !== b.uses_leftovers) return b.uses_leftovers - a.uses_leftovers;
    return b.match_percentage - a.match_percentage;
  });

  // Step 7: Take top 5 and save
  const topSuggestions = suggestions.slice(0, 5);

  // Clear old suggestions for the family
  await MealSuggestion.deleteMany({ family_id: familyId });

  // Save new suggestions
  const savedSuggestions = [];
  for (const suggestion of topSuggestions) {
    const saved = await MealSuggestion.create({
      family_id: familyId,
      recipe_id: suggestion.recipe._id,
      match_percentage: suggestion.match_percentage,
      missing_ingredients: suggestion.missing_ingredients,
      suggested_date: new Date(),
      uses_expiring_items: suggestion.uses_expiring_items,
      uses_leftovers: suggestion.uses_leftovers
    });
    savedSuggestions.push(saved);
  }

  // Populate and return
  const populatedSuggestions = await MealSuggestion.find({ family_id: familyId })
    .populate('recipe_id')
    .populate('missing_ingredients.unit_id')
    .sort({ match_percentage: -1 });

  res.status(200).json({
    status: "success",
    results: populatedSuggestions.length,
    data: {
      suggestions: populatedSuggestions,
      inventory_summary: {
        total_items: inventoryItems.length,
        total_leftovers: leftovers.length,
        recipes_checked: recipes.length
      }
    }
  });
});

//========================================================================================
// Get cached suggestions
exports.getSuggestions = catchAsync(async (req, res, next) => {
  const suggestions = await MealSuggestion.find({ family_id: req.familyAccount._id })
    .populate('recipe_id')
    .populate('missing_ingredients.unit_id')
    .sort({ match_percentage: -1 });

  res.status(200).json({
    status: "success",
    results: suggestions.length,
    data: { suggestions }
  });
});

//========================================================================================
// Delete all suggestions (refresh)
exports.clearSuggestions = catchAsync(async (req, res, next) => {
  await MealSuggestion.deleteMany({ family_id: req.familyAccount._id });

  res.status(204).json({
    status: "success",
    data: null
  });
});
