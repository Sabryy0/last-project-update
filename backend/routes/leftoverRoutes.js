const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
  createLeftoverCategory,
  getAllLeftoverCategories,
  deleteLeftoverCategory,
  addLeftover,
  getAllLeftovers,
  updateLeftover,
  deleteLeftover,
  getExpiringLeftovers
} = require('../controllers/LeftoverController');

const leftoverRouter = express.Router();

// All routes require authentication
leftoverRouter.use(protect);

// Alerts
leftoverRouter.get('/expiring', getExpiringLeftovers);

// Leftover categories
leftoverRouter.get('/categories', getAllLeftoverCategories);
leftoverRouter.post('/categories', restrictTo('Parent'), createLeftoverCategory);
leftoverRouter.delete('/categories/:categoryId', restrictTo('Parent'), deleteLeftoverCategory);

// Leftovers
leftoverRouter.get('/', getAllLeftovers);
leftoverRouter.post('/', addLeftover);
leftoverRouter.patch('/:leftoverId', updateLeftover);
leftoverRouter.delete('/:leftoverId', deleteLeftover);

module.exports = leftoverRouter;
