const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Recipe Service - Handles all recipe-related API calls
export const recipeService = {
  // Get all recipes with optional search
  getRecipes: async (familyId, search = '') => {
    try {
      const query = search ? `?familyId=${familyId}&search=${search}` : `?familyId=${familyId}`;
      const response = await fetch(`${API_BASE_URL}/recipes${query}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch recipes');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipes:', error);
      throw error;
    }
  },

  // Get recipe by ID
  getRecipeById: async (recipeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch recipe');
      return await response.json();
    } catch (error) {
      console.error('Error fetching recipe:', error);
      throw error;
    }
  },

  // Get scaled recipe (by serving size)
  getScaledRecipe: async (recipeId, servings) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/recipes/${recipeId}/scaled?servings=${servings}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to fetch scaled recipe');
      return await response.json();
    } catch (error) {
      console.error('Error fetching scaled recipe:', error);
      throw error;
    }
  },

  // Create new recipe
  createRecipe: async (recipeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(recipeData),
      });
      if (!response.ok) throw new Error('Failed to create recipe');
      return await response.json();
    } catch (error) {
      console.error('Error creating recipe:', error);
      throw error;
    }
  },

  // Update recipe
  updateRecipe: async (recipeId, recipeData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(recipeData),
      });
      if (!response.ok) throw new Error('Failed to update recipe');
      return await response.json();
    } catch (error) {
      console.error('Error updating recipe:', error);
      throw error;
    }
  },

  // Delete recipe
  deleteRecipe: async (recipeId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete recipe');
      return await response.json();
    } catch (error) {
      console.error('Error deleting recipe:', error);
      throw error;
    }
  },

  // Add ingredient to recipe
  addIngredient: async (recipeId, ingredientData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/ingredients`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(ingredientData),
      });
      if (!response.ok) throw new Error('Failed to add ingredient');
      return await response.json();
    } catch (error) {
      console.error('Error adding ingredient:', error);
      throw error;
    }
  },

  // Delete ingredient from recipe
  deleteIngredient: async (recipeId, ingredientId) => {
    try {
      const response = await fetch(
        `${API_BASE_URL}/recipes/${recipeId}/ingredients/${ingredientId}`,
        {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
        }
      );
      if (!response.ok) throw new Error('Failed to delete ingredient');
      return await response.json();
    } catch (error) {
      console.error('Error deleting ingredient:', error);
      throw error;
    }
  },

  // Add step to recipe
  addStep: async (recipeId, stepData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/steps`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(stepData),
      });
      if (!response.ok) throw new Error('Failed to add step');
      return await response.json();
    } catch (error) {
      console.error('Error adding step:', error);
      throw error;
    }
  },

  // Delete step from recipe
  deleteStep: async (recipeId, stepId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/recipes/${recipeId}/steps/${stepId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete step');
      return await response.json();
    } catch (error) {
      console.error('Error deleting step:', error);
      throw error;
    }
  },
};
