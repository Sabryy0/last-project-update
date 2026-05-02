import React, { useEffect, useState } from 'react';
import { useFood } from '../../context/FoodContext';
import '../../styles/food/Recipes.css';
import FoodContext from '../../context/FoodContext';

/**
 * Recipes Screen - Recipe library and management
 * Features: Search, create, edit, delete recipes
 */
const Recipes = ({ familyId }) => {
  const { recipes, fetchRecipes, addRecipe, deleteRecipe, loading, error } = useFood();
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewRecipeForm, setShowNewRecipeForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    description: '',
    servings: 1,
    prep_time: 0,
    cook_time: 0,
  });

  useEffect(() => {
    if (familyId) {
      fetchRecipes(familyId, searchTerm);
    }
  }, [familyId, searchTerm, fetchRecipes]);

  const handleAddRecipe = async (e) => {
    e.preventDefault();
    if (!newRecipe.name.trim()) return;

    await addRecipe({
      ...newRecipe,
      family_id: familyId,
    });

    setNewRecipe({
      name: '',
      description: '',
      servings: 1,
      prep_time: 0,
      cook_time: 0,
    });
    setShowNewRecipeForm(false);
  };

  const handleDeleteRecipe = async (recipeId) => {
    if (window.confirm('Delete this recipe?')) {
      await deleteRecipe(recipeId);
    }
  };

  return (
    <div className="recipes-screen">
      <h2 className="screen-title">Recipes</h2>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Loading...</div>}

      {/* Search Bar */}
      <div className="search-section">
        <input
          type="text"
          placeholder="Search recipes..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      {/* Add New Recipe Button */}
      <button
        className="btn btn-primary"
        onClick={() => setShowNewRecipeForm(!showNewRecipeForm)}
      >
        {showNewRecipeForm ? 'Cancel' : '+ New Recipe'}
      </button>

      {/* New Recipe Form */}
      {showNewRecipeForm && (
        <form onSubmit={handleAddRecipe} className="new-recipe-form">
          <input
            type="text"
            placeholder="Recipe name"
            value={newRecipe.name}
            onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            className="input-field"
            required
          />
          <textarea
            placeholder="Description"
            value={newRecipe.description}
            onChange={(e) => setNewRecipe({ ...newRecipe, description: e.target.value })}
            className="input-field"
            rows={3}
          />
          <div className="form-row">
            <input
              type="number"
              placeholder="Servings"
              value={newRecipe.servings}
              onChange={(e) => setNewRecipe({ ...newRecipe, servings: parseInt(e.target.value) })}
              className="input-field"
              min="1"
            />
            <input
              type="number"
              placeholder="Prep time (min)"
              value={newRecipe.prep_time}
              onChange={(e) => setNewRecipe({ ...newRecipe, prep_time: parseInt(e.target.value) })}
              className="input-field"
              min="0"
            />
            <input
              type="number"
              placeholder="Cook time (min)"
              value={newRecipe.cook_time}
              onChange={(e) => setNewRecipe({ ...newRecipe, cook_time: parseInt(e.target.value) })}
              className="input-field"
              min="0"
            />
          </div>
          <button type="submit" className="btn btn-primary">
            Create Recipe
          </button>
        </form>
      )}

      {/* Recipes List */}
      <div className="recipes-list">
        {recipes?.length > 0 ? (
          recipes.map((recipe) => (
            <div key={recipe._id} className="recipe-card">
              <div className="recipe-info">
                <h3>{recipe.name}</h3>
                <p className="recipe-description">{recipe.description}</p>
                <div className="recipe-meta">
                  <span>🍽️ Servings: {recipe.servings}</span>
                  <span>⏱️ Prep: {recipe.prep_time} min</span>
                  <span>🔥 Cook: {recipe.cook_time} min</span>
                </div>
              </div>
              <button
                className="btn btn-danger btn-small"
                onClick={() => handleDeleteRecipe(recipe._id)}
              >
                Delete
              </button>
            </div>
          ))
        ) : (
          <p className="empty-state">No recipes found</p>
        )}
      </div>
    </div>
  );
};

export default Recipes;
