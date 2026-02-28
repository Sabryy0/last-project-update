const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
  createUnit,
  getAllUnits,
  updateUnit,
  deleteUnit,
  seedUnits
} = require('../controllers/UnitController');

const unitRouter = express.Router();

// All routes require authentication
unitRouter.use(protect);

unitRouter.get('/', getAllUnits);
unitRouter.post('/seed', restrictTo('Parent'), seedUnits);
unitRouter.post('/', restrictTo('Parent'), createUnit);
unitRouter.patch('/:unitId', restrictTo('Parent'), updateUnit);
unitRouter.delete('/:unitId', restrictTo('Parent'), deleteUnit);

module.exports = unitRouter;
