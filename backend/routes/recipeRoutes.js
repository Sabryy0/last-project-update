const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
  createRecipe,
  getAllRecipes,
  getRecipe,
  getRecipeScaled,
  updateRecipe,
  deleteRecipe,
  addIngredient,
  removeIngredient,
  addStep,
  removeStep
} = require('../controllers/RecipeController');

const recipeRouter = express.Router();

// All routes require authentication
recipeRouter.use(protect);

// Recipe CRUD
recipeRouter.get('/', getAllRecipes);
recipeRouter.post('/', createRecipe);
recipeRouter.get('/:recipeId', getRecipe);
recipeRouter.get('/:recipeId/scaled', getRecipeScaled);
recipeRouter.patch('/:recipeId', updateRecipe);
recipeRouter.delete('/:recipeId', deleteRecipe);

// Ingredients
recipeRouter.post('/:recipeId/ingredients', addIngredient);
recipeRouter.delete('/:recipeId/ingredients/:ingredientId', removeIngredient);

// Steps
recipeRouter.post('/:recipeId/steps', addStep);
recipeRouter.delete('/:recipeId/steps/:stepId', removeStep);

module.exports = recipeRouter;
