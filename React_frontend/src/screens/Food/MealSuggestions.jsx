import React, { useEffect } from 'react';
import { useFood } from '../../context/FoodContext';
import '../../styles/food/MealSuggestions.css';

/**
 * MealSuggestions Screen - AI-generated meal recommendations
 * Features: Generate suggestions, view suggestions, clear old ones
 * Algorithm: Prioritizes expiring items → leftovers → match percentage (70% min)
 */
const MealSuggestions = ({ familyId }) => {
  const { suggestions, fetchSuggestions, generateSuggestions, clearSuggestions, loading, error } =
    useFood();

  useEffect(() => {
    if (familyId) {
      fetchSuggestions(familyId);
    }
  }, [familyId, fetchSuggestions]);

  const handleGenerateSuggestions = async () => {
    if (familyId) {
      await generateSuggestions(familyId);
    }
  };

  const handleClearSuggestions = async () => {
    if (window.confirm('Clear all suggestions?')) {
      if (familyId) {
        await clearSuggestions(familyId);
      }
    }
  };

  return (
    <div className="meal-suggestions-screen">
      <h2 className="screen-title">Meal Suggestions</h2>

      {error && <div className="error-message">{error}</div>}
      {loading && <div className="loading">Generating suggestions...</div>}

      {/* Action Buttons */}
      <div className="action-buttons">
        <button className="btn btn-primary" onClick={handleGenerateSuggestions} disabled={loading}>
          ✨ Generate Suggestions
        </button>
        <button
          className="btn btn-secondary"
          onClick={handleClearSuggestions}
          disabled={loading || suggestions?.length === 0}
        >
          🗑️ Clear All
        </button>
      </div>

      {/* Suggestions List */}
      <div className="suggestions-list">
        {suggestions?.length > 0 ? (
          suggestions.map((suggestion, idx) => (
            <div key={suggestion._id || idx} className="suggestion-card">
              <div className="suggestion-header">
                <h3>{suggestion.recipe_name}</h3>
                <span className="match-badge">{suggestion.match_percentage}% match</span>
              </div>

              <div className="suggestion-info">
                <p className="suggestion-reason">{suggestion.reason}</p>

                <div className="suggestion-details">
                  {suggestion.expiring_items?.length > 0 && (
                    <div className="detail-group">
                      <h4>⏰ Expiring Items (Priority):</h4>
                      <ul>
                        {suggestion.expiring_items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestion.leftover_items?.length > 0 && (
                    <div className="detail-group">
                      <h4>🍽️ Leftover Items:</h4>
                      <ul>
                        {suggestion.leftover_items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {suggestion.available_ingredients?.length > 0 && (
                    <div className="detail-group">
                      <h4>📦 Available Ingredients:</h4>
                      <ul>
                        {suggestion.available_ingredients.slice(0, 5).map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                        {suggestion.available_ingredients.length > 5 && (
                          <li>+{suggestion.available_ingredients.length - 5} more</li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>
              </div>

              <button className="btn btn-primary btn-small">📝 Plan This Meal</button>
            </div>
          ))
        ) : (
          <div className="empty-state">
            <p>No suggestions yet. Generate some recommendations!</p>
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="info-section">
        <h3>How Suggestions Work</h3>
        <ol>
          <li>✅ Recipes are ranked by ingredient availability</li>
          <li>⏰ Items expiring soon are prioritized</li>
          <li>🍽️ Leftovers are preferred to reduce waste</li>
          <li>📊 Only recipes with 70%+ match are shown</li>
        </ol>
      </div>
    </div>
  );
};

export default MealSuggestions;
