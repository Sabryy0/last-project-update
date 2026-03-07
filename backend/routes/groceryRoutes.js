const express = require('express');
const { protect } = require('../controllers/AuthController');
const {
  getAllGroceryLists,
  getGroceryListById,
  createGroceryList,
  updateGroceryList,
  deleteGroceryList,
  addGroceryItem,
  updateGroceryItem,
  deleteGroceryItem,
} = require('../controllers/GroceryListController');

const groceryRouter = express.Router();

groceryRouter.use(protect);

// Grocery lists
groceryRouter.get('/', getAllGroceryLists);
groceryRouter.post('/', createGroceryList);
groceryRouter.get('/:id', getGroceryListById);
groceryRouter.patch('/:id', updateGroceryList);
groceryRouter.delete('/:id', deleteGroceryList);

// Grocery items within a list
groceryRouter.post('/:id/items', addGroceryItem);
groceryRouter.patch('/items/:itemId', updateGroceryItem);
groceryRouter.delete('/items/:itemId', deleteGroceryItem);

module.exports = groceryRouter;
