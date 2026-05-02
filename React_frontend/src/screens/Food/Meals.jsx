import React, { useEffect, useState } from 'react';
import { useFood } from '../../context/FoodContext';
import '../../styles/food/Meals.css';

/**
 * Meals Screen - Date-based meal planning
 * Features: Create/edit/delete meals, add ingredients, date navigation
 */
const Meals = ({ familyId }) => {
  const { selectedDate, setSelectedDate, meals, fetchMeals, addMeal, deleteMeal, loading, error } =
    useFood();
  const [showNewMealForm, setShowNewMealForm] = useState(false);
  const [newMeal, setNewMeal] = useState({
    name: '',
    meal_type: 'Lunch', // Breakfast, Lunch, Dinner, Snack
    date: selectedDate,
  });

  useEffect(() => {
    if (familyId) {
      const dateStr = selectedDate.toISOString().split('T')[0];
      fetchMeals(familyId, dateStr, dateStr);
    }
  }, [familyId, selectedDate, fetchMeals]);

  const handleDateChange = (e) => {
    setSelectedDate(new Date(e.target.value));
  };

  const handleAddMeal = async (e) => {
    e.preventDefault();
    if (!newMeal.name.trim()) return;

    await addMeal({
      ...newMeal,
      family_id: familyId,
      date: selectedDate.toISOString().split('T')[0],
    });

    setNewMeal({ name: '', meal_type: 'Lunch', date: selectedDate });
    setShowNewMealForm(false);
  };

  const handleDeleteMeal = async (mealId) => {
    if (window.confirm('Delete this meal?')) {
      await deleteMeal(mealId);
    }
  };

  return (
    <div className="meals-screen">
      <h2 className="screen-title">Meals</h2>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Date Picker */}
      <div className="date-picker-section">
        <input
          type="date"
          value={selectedDate.toISOString().split('T')[0]}
          onChange={handleDateChange}
          className="date-input"
        />
      </div>

      {/* Add New Meal Button */}
      <button
        className="btn btn-primary"
        onClick={() => setShowNewMealForm(!showNewMealForm)}
      >
        {showNewMealForm ? 'Cancel' : '+ Add Meal'}
      </button>

      {/* New Meal Form */}
      {showNewMealForm && (
        <form onSubmit={handleAddMeal} className="new-meal-form">
          <input
            type="text"
            placeholder="Meal name"
            value={newMeal.name}
            onChange={(e) => setNewMeal({ ...newMeal, name: e.target.value })}
            className="input-field"
            required
          />
          <select
            value={newMeal.meal_type}
            onChange={(e) => setNewMeal({ ...newMeal, meal_type: e.target.value })}
            className="input-field"
          >
            <option>Breakfast</option>
            <option>Lunch</option>
            <option>Dinner</option>
            <option>Snack</option>
          </select>
          <button type="submit" className="btn btn-primary">
            Create Meal
          </button>
        </form>
      )}

      {/* Meals List */}
      <div className="meals-list">
        {meals?.length > 0 ? (
          meals.map((meal) => (
            <div key={meal._id} className="meal-card">
              <div className="meal-info">
                <h3>{meal.name}</h3>
                <p className="meal-type">{meal.meal_type}</p>
                <p className="meal-items">{meal.items?.length || 0} ingredients</p>
              </div>
              <button
                className="btn btn-danger btn-small"
                onClick={() => handleDeleteMeal(meal._id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">No meals for this date</p>
        )}
      </div>
    </div>
  );
};

export default Meals;
