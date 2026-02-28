const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
  createInventory,
  getAllInventories,
  deleteInventory,
  createItemCategory,
  getAllItemCategories,
  deleteItemCategory,
  addItem,
  getInventoryItems,
  getAllFamilyItems,
  updateItem,
  deleteItem,
  getAlerts
} = require('../controllers/InventoryController');

const inventoryRouter = express.Router();

// All routes require authentication
inventoryRouter.use(protect);

// Alerts
inventoryRouter.get('/alerts', getAlerts);

// All family items (across inventories)
inventoryRouter.get('/all-items', getAllFamilyItems);

// Item categories
inventoryRouter.get('/categories', getAllItemCategories);
inventoryRouter.post('/categories', restrictTo('Parent'), createItemCategory);
inventoryRouter.delete('/categories/:categoryId', restrictTo('Parent'), deleteItemCategory);

// Inventories
inventoryRouter.get('/', getAllInventories);
inventoryRouter.post('/', restrictTo('Parent'), createInventory);
inventoryRouter.delete('/:inventoryId', restrictTo('Parent'), deleteInventory);

// Inventory items
inventoryRouter.get('/:inventoryId/items', getInventoryItems);
inventoryRouter.post('/:inventoryId/items', addItem);
inventoryRouter.patch('/items/:itemId', updateItem);
inventoryRouter.delete('/items/:itemId', deleteItem);

module.exports = inventoryRouter;
