import React, { createContext, useState, useCallback } from 'react';
import { mealService } from '../services/foodServices/mealService';
import { recipeService } from '../services/foodServices/recipeService';
import { mealSuggestionService } from '../services/foodServices/mealSuggestionService';
import { leftoverService } from '../services/foodServices/leftoverService';


export const FoodContext = createContext();

export const FoodProvider = ({ children }) => {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [meals, setMeals] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [suggestions, setSuggestions] = useState([]);
  const [leftovers, setLeftovers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Meal operations
  const fetchMeals = useCallback(async (familyId, startDate, endDate) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealService.getMeals(familyId, startDate, endDate);
      setMeals(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch meals:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addMeal = useCallback(async (mealData) => {
    setLoading(true);
    setError(null);
    try {
      const newMeal = await mealService.createMeal(mealData);
      setMeals((prev) => [...prev, newMeal]);
      return newMeal;
    } catch (err) {
      setError(err.message);
      console.error('Failed to add meal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateMeal = useCallback(async (mealId, mealData) => {
    setLoading(true);
    setError(null);
    try {
      const updated = await mealService.updateMeal(mealId, mealData);
      setMeals((prev) => prev.map((m) => (m._id === mealId ? updated : m)));
      return updated;
    } catch (err) {
      setError(err.message);
      console.error('Failed to update meal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteMeal = useCallback(async (mealId) => {
    setLoading(true);
    setError(null);
    try {
      await mealService.deleteMeal(mealId);
      setMeals((prev) => prev.filter((m) => m._id !== mealId));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete meal:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Recipe operations
  const fetchRecipes = useCallback(async (familyId, search = '') => {
    setLoading(true);
    setError(null);
    try {
      const data = await recipeService.getRecipes(familyId, search);
      setRecipes(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch recipes:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addRecipe = useCallback(async (recipeData) => {
    setLoading(true);
    setError(null);
    try {
      const newRecipe = await recipeService.createRecipe(recipeData);
      setRecipes((prev) => [...prev, newRecipe]);
      return newRecipe;
    } catch (err) {
      setError(err.message);
      console.error('Failed to add recipe:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteRecipe = useCallback(async (recipeId) => {
    setLoading(true);
    setError(null);
    try {
      await recipeService.deleteRecipe(recipeId);
      setRecipes((prev) => prev.filter((r) => r._id !== recipeId));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete recipe:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Meal Suggestion operations
  const fetchSuggestions = useCallback(async (familyId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealSuggestionService.getSuggestions(familyId);
      setSuggestions(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const generateSuggestions = useCallback(async (familyId, params = {}) => {
    setLoading(true);
    setError(null);
    try {
      const data = await mealSuggestionService.generateSuggestions(familyId, params);
      setSuggestions(data);
      return data;
    } catch (err) {
      setError(err.message);
      console.error('Failed to generate suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const clearSuggestions = useCallback(async (familyId) => {
    setLoading(true);
    setError(null);
    try {
      await mealSuggestionService.clearSuggestions(familyId);
      setSuggestions([]);
    } catch (err) {
      setError(err.message);
      console.error('Failed to clear suggestions:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Leftover operations
  const fetchLeftovers = useCallback(async (familyId) => {
    setLoading(true);
    setError(null);
    try {
      const data = await leftoverService.getLeftovers(familyId);
      setLeftovers(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch leftovers:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const addLeftover = useCallback(async (leftoverData) => {
    setLoading(true);
    setError(null);
    try {
      const newLeftover = await leftoverService.createLeftover(leftoverData);
      setLeftovers((prev) => [...prev, newLeftover]);
      return newLeftover;
    } catch (err) {
      setError(err.message);
      console.error('Failed to add leftover:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const deleteLeftover = useCallback(async (leftoverId) => {
    setLoading(true);
    setError(null);
    try {
      await leftoverService.deleteLeftover(leftoverId);
      setLeftovers((prev) => prev.filter((l) => l._id !== leftoverId));
    } catch (err) {
      setError(err.message);
      console.error('Failed to delete leftover:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  const value = {
    // State
    selectedDate,
    setSelectedDate,
    meals,
    recipes,
    suggestions,
    leftovers,
    loading,
    error,

    // Meal operations
    fetchMeals,
    addMeal,
    updateMeal,
    deleteMeal,

    // Recipe operations
    fetchRecipes,
    addRecipe,
    deleteRecipe,

    // Suggestion operations
    fetchSuggestions,
    generateSuggestions,
    clearSuggestions,

    // Leftover operations
    fetchLeftovers,
    addLeftover,
    deleteLeftover,
  };

  return <FoodContext.Provider value={value}>{children}</FoodContext.Provider>;
};

export const useFood = () => {
  const context = React.useContext(FoodContext);
  if (!context) {
    throw new Error('useFood must be used within a FoodProvider');
  }
  return context;
};
