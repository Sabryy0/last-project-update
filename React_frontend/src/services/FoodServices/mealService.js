const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Meal Service - Handles all meal-related API calls
export const mealService = {
  // Get all meals for a date range
  getMeals: async (familyId, startDate, endDate) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/meals?familyId=${familyId}&startDate=${startDate}&endDate=${endDate}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch meals');
      return await response.json();
    } catch (error) {
      console.error('Error fetching meals:', error);
      throw error;
    }
  },

  // Get single meal by ID
  getMealById: async (mealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch meal');
      return await response.json();
    } catch (error) {
      console.error('Error fetching meal:', error);
      throw error;
    }
  },

  // Create new meal
  createMeal: async (mealData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(mealData),
      });
      if (!response.ok) throw new Error('Failed to create meal');
      return await response.json();
    } catch (error) {
      console.error('Error creating meal:', error);
      throw error;
    }
  },

  // Update meal
  updateMeal: async (mealId, mealData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(mealData),
      });
      if (!response.ok) throw new Error('Failed to update meal');
      return await response.json();
    } catch (error) {
      console.error('Error updating meal:', error);
      throw error;
    }
  },

  // Delete meal
  deleteMeal: async (mealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete meal');
      return await response.json();
    } catch (error) {
      console.error('Error deleting meal:', error);
      throw error;
    }
  },

  // Add item to meal
  addMealItem: async (mealId, itemData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(itemData),
      });
      if (!response.ok) throw new Error('Failed to add meal item');
      return await response.json();
    } catch (error) {
      console.error('Error adding meal item:', error);
      throw error;
    }
  },

  // Remove item from meal
  removeMealItem: async (mealId, itemId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}/items/${itemId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to remove meal item');
      return await response.json();
    } catch (error) {
      console.error('Error removing meal item:', error);
      throw error;
    }
  },

  // Mark meal as prepared
  prepareMeal: async (mealId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meals/${mealId}/prepare`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to prepare meal');
      return await response.json();
    } catch (error) {
      console.error('Error preparing meal:', error);
      throw error;
    }
  },
};
