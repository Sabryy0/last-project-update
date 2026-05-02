import React, { useEffect, useState } from 'react';
import { useFood } from '../../context/FoodContext';
import '../../styles/food/RecipeDetail.css';

/**
 * RecipeDetail Screen - Detailed recipe editor
 * Features: Edit ingredients, cooking steps, scale recipe by serving size
 */
const RecipeDetail = ({ recipeId, familyId, onBack }) => {
  const { recipes } = useFood();
  const [recipe, setRecipe] = useState(null);
  const [servingSize, setServingSize] = useState(1);
  const [showIngredientForm, setShowIngredientForm] = useState(false);
  const [newIngredient, setNewIngredient] = useState({
    name: '',
    quantity: 1,
    unit: '',
  });

  useEffect(() => {
    const found = recipes?.find((r) => r._id === recipeId);
    if (found) {
      setRecipe(found);
      setServingSize(found.servings || 1);
    }
  }, [recipeId, recipes]);

  if (!recipe) {
    return (
      <div className="recipe-detail-screen">
        <button className="btn btn-secondary" onClick={onBack}>
          ← Back
        </button>
        <p>Loading recipe...</p>
      </div>
    );
  }

  return (
    <div className="recipe-detail-screen">
      <button className="btn btn-secondary" onClick={onBack}>
        ← Back
      </button>

      <h2>{recipe.name}</h2>

      {/* Serving Scaler */}
      <div className="serving-scaler">
        <label htmlFor="servings">Servings:</label>
        <input
          id="servings"
          type="number"
          value={servingSize}
          onChange={(e) => setServingSize(parseInt(e.target.value))}
          min="1"
          className="input-field"
        />
        <p className="scaling-info">Ingredients will scale proportionally</p>
      </div>

      {/* Recipe Info */}
      <div className="recipe-meta-section">
        <div className="meta-item">
          <span className="label">Prep Time:</span>
          <span className="value">{recipe.prep_time} minutes</span>
        </div>
        <div className="meta-item">
          <span className="label">Cook Time:</span>
          <span className="value">{recipe.cook_time} minutes</span>
        </div>
        <div className="meta-item">
          <span className="label">Original Servings:</span>
          <span className="value">{recipe.servings}</span>
        </div>
      </div>

      {/* Ingredients Section */}
      <div className="ingredients-section">
        <h3>Ingredients</h3>

        <button
          className="btn btn-primary btn-small"
          onClick={() => setShowIngredientForm(!showIngredientForm)}
        >
          {showIngredientForm ? 'Cancel' : '+ Add Ingredient'}
        </button>

        {showIngredientForm && (
          <form className="ingredient-form">
            <input
              type="text"
              placeholder="Ingredient name"
              value={newIngredient.name}
              onChange={(e) => setNewIngredient({ ...newIngredient, name: e.target.value })}
              className="input-field"
            />
            <input
              type="number"
              placeholder="Quantity"
              value={newIngredient.quantity}
              onChange={(e) =>
                setNewIngredient({ ...newIngredient, quantity: parseFloat(e.target.value) })
              }
              className="input-field"
              step="0.1"
              min="0"
            />
            <input
              type="text"
              placeholder="Unit (cups, tsp, g, etc)"
              value={newIngredient.unit}
              onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
              className="input-field"
            />
            <button type="submit" className="btn btn-primary">
              Add
            </button>
          </form>
        )}

        <div className="ingredients-list">
          {recipe.ingredients?.length > 0 ? (
            recipe.ingredients.map((ingredient, idx) => (
              <div key={idx} className="ingredient-item">
                <p>
                  {ingredient.name} - {ingredient.quantity * (servingSize / recipe.servings)}{' '}
                  {ingredient.unit}
                </p>
              </div>
            ))
          ) : (
            <p className="empty-state">No ingredients added</p>
          )}
        </div>
      </div>

      {/* Cooking Steps Section */}
      <div className="steps-section">
        <h3>Cooking Steps</h3>

        <button className="btn btn-primary btn-small">+ Add Step</button>

        <div className="steps-list">
          {recipe.steps?.length > 0 ? (
            recipe.steps.map((step, idx) => (
              <div key={idx} className="step-item">
                <span className="step-number">{idx + 1}</span>
                <p className="step-text">{step.description}</p>
              </div>
            ))
          ) : (
            <p className="empty-state">No steps added</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default RecipeDetail;
