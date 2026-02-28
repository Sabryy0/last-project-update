const AppError = require("../utils/appError");
const { catchAsync } = require("../utils/catchAsync");
const Recipe = require("../models/recipeModel");
const RecipeIngredient = require("../models/recipeIngredientModel");
const RecipeStep = require("../models/recipeStepModel");

//========================================================================================
// Create a new recipe with ingredients and steps
exports.createRecipe = catchAsync(async (req, res, next) => {
  const { recipe_name, category, serving_size, ingredients, steps } = req.body;

  if (!recipe_name || !category || !serving_size) {
    return next(new AppError("Please provide recipe_name, category, and serving_size", 400));
  }

  // Create recipe
  const recipe = await Recipe.create({
    member_mail: req.member.mail,
    recipe_name,
    category,
    serving_size,
    family_id: req.familyAccount._id
  });

  // Create ingredients if provided
  if (ingredients && ingredients.length > 0) {
    const ingredientDocs = ingredients.map(ing => ({
      recipe_id: recipe._id,
      ingredient_name: ing.ingredient_name,
      quantity: ing.quantity,
      unit_id: ing.unit_id,
      notes: ing.notes || ''
    }));
    await RecipeIngredient.insertMany(ingredientDocs);
  }

  // Create steps if provided
  if (steps && steps.length > 0) {
    const stepDocs = steps.map((step, index) => ({
      recipe_id: recipe._id,
      step_number: step.step_number || index + 1,
      instruction: step.instruction,
      duration: step.duration || null
    }));
    await RecipeStep.insertMany(stepDocs);
  }

  // Fetch full recipe with ingredients and steps
  const fullRecipe = await getFullRecipe(recipe._id);

  res.status(201).json({
    status: "success",
    data: { recipe: fullRecipe }
  });
});

//========================================================================================
// Get all recipes for the family
exports.getAllRecipes = catchAsync(async (req, res, next) => {
  const { category } = req.query;

  const filter = { family_id: req.familyAccount._id };
  if (category) filter.category = category;

  const recipes = await Recipe.find(filter)
    .sort({ createdAt: -1 });

  res.status(200).json({
    status: "success",
    results: recipes.length,
    data: { recipes }
  });
});

//========================================================================================
// Get a single recipe with full details (ingredients + steps)
exports.getRecipe = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findOne({
    _id: recipeId,
    family_id: req.familyAccount._id
  });

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  const fullRecipe = await getFullRecipe(recipeId);

  res.status(200).json({
    status: "success",
    data: { recipe: fullRecipe }
  });
});

//========================================================================================
// Get recipe with scaled ingredients for different serving size
exports.getRecipeScaled = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;
  const { servings } = req.query;

  if (!servings || servings < 1) {
    return next(new AppError("Please provide a valid servings number", 400));
  }

  const recipe = await Recipe.findOne({
    _id: recipeId,
    family_id: req.familyAccount._id
  });

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  const ingredients = await RecipeIngredient.find({ recipe_id: recipeId })
    .populate('unit_id');
  const steps = await RecipeStep.find({ recipe_id: recipeId })
    .sort({ step_number: 1 });

  // Scale ingredients
  const scaleFactor = servings / recipe.serving_size;
  const scaledIngredients = ingredients.map(ing => ({
    ...ing.toObject(),
    original_quantity: ing.quantity,
    quantity: Math.round(ing.quantity * scaleFactor * 100) / 100
  }));

  res.status(200).json({
    status: "success",
    data: {
      recipe: {
        ...recipe.toObject(),
        original_serving_size: recipe.serving_size,
        serving_size: Number(servings),
        ingredients: scaledIngredients,
        steps
      }
    }
  });
});

//========================================================================================
// Update a recipe
exports.updateRecipe = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;
  const { recipe_name, category, serving_size } = req.body;

  const recipe = await Recipe.findOne({
    _id: recipeId,
    family_id: req.familyAccount._id
  });

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Only creator or Parent can edit
  if (recipe.member_mail !== req.member.mail && req.member.member_type_id.type !== 'Parent') {
    return next(new AppError("You don't have permission to edit this recipe", 403));
  }

  if (recipe_name) recipe.recipe_name = recipe_name;
  if (category) recipe.category = category;
  if (serving_size) recipe.serving_size = serving_size;

  await recipe.save();

  const fullRecipe = await getFullRecipe(recipeId);

  res.status(200).json({
    status: "success",
    data: { recipe: fullRecipe }
  });
});

//========================================================================================
// Delete a recipe (cascades to ingredients and steps)
exports.deleteRecipe = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;

  const recipe = await Recipe.findOne({
    _id: recipeId,
    family_id: req.familyAccount._id
  });

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Only creator or Parent can delete
  if (recipe.member_mail !== req.member.mail && req.member.member_type_id.type !== 'Parent') {
    return next(new AppError("You don't have permission to delete this recipe", 403));
  }

  // Cascade delete
  await RecipeIngredient.deleteMany({ recipe_id: recipeId });
  await RecipeStep.deleteMany({ recipe_id: recipeId });
  await Recipe.findByIdAndDelete(recipeId);

  res.status(204).json({
    status: "success",
    data: null
  });
});

//========================================================================================
// Add ingredient to existing recipe
exports.addIngredient = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;
  const { ingredient_name, quantity, unit_id, notes } = req.body;

  if (!ingredient_name || !quantity || !unit_id) {
    return next(new AppError("Please provide ingredient_name, quantity, and unit_id", 400));
  }

  const recipe = await Recipe.findOne({
    _id: recipeId,
    family_id: req.familyAccount._id
  });

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  const ingredient = await RecipeIngredient.create({
    recipe_id: recipeId,
    ingredient_name,
    quantity,
    unit_id,
    notes: notes || ''
  });

  await ingredient.populate('unit_id');

  res.status(201).json({
    status: "success",
    data: { ingredient }
  });
});

//========================================================================================
// Remove ingredient from recipe
exports.removeIngredient = catchAsync(async (req, res, next) => {
  const { recipeId, ingredientId } = req.params;

  const ingredient = await RecipeIngredient.findOne({
    _id: ingredientId,
    recipe_id: recipeId
  });

  if (!ingredient) {
    return next(new AppError("Ingredient not found", 404));
  }

  await RecipeIngredient.findByIdAndDelete(ingredientId);

  res.status(204).json({
    status: "success",
    data: null
  });
});

//========================================================================================
// Add step to existing recipe
exports.addStep = catchAsync(async (req, res, next) => {
  const { recipeId } = req.params;
  const { step_number, instruction, duration } = req.body;

  if (!instruction) {
    return next(new AppError("Please provide the instruction", 400));
  }

  const recipe = await Recipe.findOne({
    _id: recipeId,
    family_id: req.familyAccount._id
  });

  if (!recipe) {
    return next(new AppError("Recipe not found", 404));
  }

  // Auto-assign step number if not provided
  let finalStepNumber = step_number;
  if (!finalStepNumber) {
    const lastStep = await RecipeStep.findOne({ recipe_id: recipeId })
      .sort({ step_number: -1 });
    finalStepNumber = lastStep ? lastStep.step_number + 1 : 1;
  }

  const step = await RecipeStep.create({
    recipe_id: recipeId,
    step_number: finalStepNumber,
    instruction,
    duration: duration || null
  });

  res.status(201).json({
    status: "success",
    data: { step }
  });
});

//========================================================================================
// Remove step from recipe
exports.removeStep = catchAsync(async (req, res, next) => {
  const { recipeId, stepId } = req.params;

  const step = await RecipeStep.findOne({
    _id: stepId,
    recipe_id: recipeId
  });

  if (!step) {
    return next(new AppError("Step not found", 404));
  }

  await RecipeStep.findByIdAndDelete(stepId);

  // Reorder remaining steps
  const remainingSteps = await RecipeStep.find({ recipe_id: recipeId })
    .sort({ step_number: 1 });

  for (let i = 0; i < remainingSteps.length; i++) {
    remainingSteps[i].step_number = i + 1;
    await remainingSteps[i].save();
  }

  res.status(204).json({
    status: "success",
    data: null
  });
});

//========================================================================================
// Helper: get full recipe with ingredients and steps
async function getFullRecipe(recipeId) {
  const recipe = await Recipe.findById(recipeId);
  const ingredients = await RecipeIngredient.find({ recipe_id: recipeId })
    .populate('unit_id');
  const steps = await RecipeStep.find({ recipe_id: recipeId })
    .sort({ step_number: 1 });

  return {
    ...recipe.toObject(),
    ingredients,
    steps
  };
}
