const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
  createMeal,
  getMeals,
  getMeal,
  updateMeal,
  deleteMeal,
  addMealItem,
  removeMealItem,
  prepareMealFromRecipe
} = require('../controllers/MealController');

const mealRouter = express.Router();

// All routes require authentication
mealRouter.use(protect);

// Meal CRUD
mealRouter.get('/', getMeals);
mealRouter.post('/', createMeal);
mealRouter.get('/:mealId', getMeal);
mealRouter.patch('/:mealId', updateMeal);
mealRouter.delete('/:mealId', deleteMeal);

// Meal items
mealRouter.post('/:mealId/items', addMealItem);
mealRouter.delete('/:mealId/items/:mealItemId', removeMealItem);

// Prepare meal from recipe (auto-deduct)
mealRouter.post('/:mealId/prepare', prepareMealFromRecipe);

module.exports = mealRouter;
