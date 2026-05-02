const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Meal Suggestion Service - Handles AI meal suggestion API calls
export const mealSuggestionService = {
  // Get all meal suggestions
  getSuggestions: async (familyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meal-suggestions?familyId=${familyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch suggestions');
      return await response.json();
    } catch (error) {
      console.error('Error fetching suggestions:', error);
      throw error;
    }
  },

  // Generate new meal suggestions
  generateSuggestions: async (familyId, params = {}) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meal-suggestions/generate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({
          family_id: familyId,
          ...params,
        }),
      });
      if (!response.ok) throw new Error('Failed to generate suggestions');
      return await response.json();
    } catch (error) {
      console.error('Error generating suggestions:', error);
      throw error;
    }
  },

  // Delete all suggestions
  clearSuggestions: async (familyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meal-suggestions`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ family_id: familyId }),
      });
      if (!response.ok) throw new Error('Failed to clear suggestions');
      return await response.json();
    } catch (error) {
      console.error('Error clearing suggestions:', error);
      throw error;
    }
  },

  // Delete specific suggestion
  deleteSuggestion: async (suggestionId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/meal-suggestions/${suggestionId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete suggestion');
      return await response.json();
    } catch (error) {
      console.error('Error deleting suggestion:', error);
      throw error;
    }
  },
};
