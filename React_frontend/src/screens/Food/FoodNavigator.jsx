import React, { useState } from 'react';
import { FoodHub, Meals, Recipes, RecipeDetail, MealSuggestions, Leftovers } from './index';
import { Home, Users, Calendar, MessageCircle, Settings, MapPin, Shield, LogOut } from 'lucide-react';
import { memberAPI } from '../../services/api';
import '../../styles/food/FoodNavigator.css';

/**
 * FoodNavigator - Main navigation component for the food module
 * Routes between all food screens: hub, meals, recipes, leftovers, suggestions
 * Passes goToScreen handler to all components
 */
const FoodNavigator = ({ familyId }) => {
  const [currentScreen, setCurrentScreen] = useState('hub');
  const [selectedRecipeId, setSelectedRecipeId] = useState(null);

  // Navigate to a screen
  const goToScreen = (screen) => {
    if (screen === 'recipe-detail' && selectedRecipeId) {
      setCurrentScreen('recipe-detail');
    } else if (screen === 'categories') {
      // For now, go to inventory until categories screen is built
      goToScreen('inventory');
    } else if (screen === 'groceries') {
      // For now, go to hub until groceries screen is built
      setCurrentScreen('hub');
    } else if (screen === 'receipts') {
      // For now, go to hub until receipts screen is built
      setCurrentScreen('hub');
    } else if (screen === 'alerts') {
      // For now, go to leftovers (it has expiring alerts)
      setCurrentScreen('leftovers');
    } else if (screen === 'inventory') {
      // For now, go to hub until inventory screen is built
      setCurrentScreen('hub');
    } else {
      setCurrentScreen(screen);
    }
  };

  // Render the appropriate screen
  const renderScreen = () => {
    switch (currentScreen) {
      case 'hub':
        return <FoodHub familyId={familyId} goToScreen={goToScreen} />;
      case 'meals':
        return <Meals familyId={familyId} goToScreen={goToScreen} />;
      case 'recipes':
        return <Recipes familyId={familyId} goToScreen={goToScreen} />;
      case 'recipe-detail':
        return (
          <RecipeDetail
            recipeId={selectedRecipeId}
            familyId={familyId}
            onBack={() => setCurrentScreen('recipes')}
          />
        );
      case 'suggestions':
        return <MealSuggestions familyId={familyId} goToScreen={goToScreen} />;
      case 'leftovers':
        return <Leftovers familyId={familyId} goToScreen={goToScreen} />;
      default:
        return <FoodHub familyId={familyId} goToScreen={goToScreen} />;
    }
  };

  return (
    <div className="food-navigator">
      {/* Screen Content */}
      <div className="food-content">{renderScreen()}</div>
    </div>
  );
};

export default FoodNavigator;
