const express = require('express');
const { protect } = require('../controllers/AuthController');
const {
  generateSuggestions,
  getSuggestions,
  clearSuggestions
} = require('../controllers/MealSuggestionController');

const mealSuggestionRouter = express.Router();

// All routes require authentication
mealSuggestionRouter.use(protect);

mealSuggestionRouter.get('/', getSuggestions);
mealSuggestionRouter.post('/generate', generateSuggestions);
mealSuggestionRouter.delete('/', clearSuggestions);

module.exports = mealSuggestionRouter;
