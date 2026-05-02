const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

// Leftover Service - Handles all leftover/expiry tracking API calls
export const leftoverService = {
  // Get all leftovers
  getLeftovers: async (familyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftovers?familyId=${familyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch leftovers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leftovers:', error);
      throw error;
    }
  },

  // Get expiring leftovers (within 0-3 days)
  getExpiringLeftovers: async (familyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftovers/expiring?familyId=${familyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch expiring leftovers');
      return await response.json();
    } catch (error) {
      console.error('Error fetching expiring leftovers:', error);
      throw error;
    }
  },

  // Get leftover by ID
  getLeftoverById: async (leftoverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftovers/${leftoverId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch leftover');
      return await response.json();
    } catch (error) {
      console.error('Error fetching leftover:', error);
      throw error;
    }
  },

  // Create new leftover
  createLeftover: async (leftoverData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftovers`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(leftoverData),
      });
      if (!response.ok) throw new Error('Failed to create leftover');
      return await response.json();
    } catch (error) {
      console.error('Error creating leftover:', error);
      throw error;
    }
  },

  // Update leftover
  updateLeftover: async (leftoverId, leftoverData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftovers/${leftoverId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(leftoverData),
      });
      if (!response.ok) throw new Error('Failed to update leftover');
      return await response.json();
    } catch (error) {
      console.error('Error updating leftover:', error);
      throw error;
    }
  },

  // Delete leftover
  deleteLeftover: async (leftoverId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftovers/${leftoverId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to delete leftover');
      return await response.json();
    } catch (error) {
      console.error('Error deleting leftover:', error);
      throw error;
    }
  },

  // Get leftover categories
  getLeftoverCategories: async (familyId) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftover-categories?familyId=${familyId}`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Failed to fetch categories');
      return await response.json();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  },

  // Create leftover category
  createCategory: async (categoryData) => {
    try {
      const response = await fetch(`${API_BASE_URL}/leftover-categories`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(categoryData),
      });
      if (!response.ok) throw new Error('Failed to create category');
      return await response.json();
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  },
};
