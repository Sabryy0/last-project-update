# React Food Module - Implementation Guide

## Project Structure

```
React_frontend/src/
├── screens/Food/
│   ├── FoodHub.jsx              # Dashboard (stats, alerts, expiring preview)
│   ├── Meals.jsx                # Date-based meal planning
│   ├── Recipes.jsx              # Recipe library with search
│   ├── RecipeDetail.jsx         # Recipe editor with scaling
│   ├── MealSuggestions.jsx      # AI-powered suggestions
│   ├── Leftovers.jsx            # Expiry tracking with tabs
│   ├── FoodNavigator.jsx        # Main navigation component
│   └── index.js                 # Screen exports
├── services/foodServices/
│   ├── mealService.js           # Meal API calls
│   ├── recipeService.js         # Recipe API calls
│   ├── mealSuggestionService.js # Suggestion API calls
│   ├── leftoverService.js       # Leftover API calls
│   └── index.js                 # Service exports
├── context/
│   └── FoodContext.jsx          # Global state management (meals, recipes, etc.)
└── styles/food/
    ├── FoodHub.css
    ├── Meals.css
    ├── Recipes.css
    ├── RecipeDetail.css
    ├── MealSuggestions.css
    ├── Leftovers.css
    └── FoodNavigator.css
```

## Setup Instructions

### 1. Wrap App with FoodProvider

In your main `App.jsx` or `index.jsx`:

```jsx
import { FoodProvider } from './context/FoodContext';
import FoodNavigator from './screens/Food/FoodNavigator';

function App() {
  const familyId = 'YOUR_FAMILY_ID'; // Get from auth context

  return (
    <FoodProvider>
      <FoodNavigator familyId={familyId} />
    </FoodProvider>
  );
}
```

### 2. Using the Food Context

In any component:

```jsx
import { useFood } from '../context/FoodContext';

function MyComponent() {
  const {
    meals,
    recipes,
    suggestions,
    leftovers,
    fetchMeals,
    addMeal,
    addRecipe,
    // ... other methods
  } = useFood();

  // Use the context values and methods
}
```

## API Integration

All API services are pre-configured to hit:
- **Base URL**: `http://localhost:8000/api` (or `process.env.REACT_APP_API_URL`)

### Environment Variables

Create a `.env` file in `React_frontend/`:

```
REACT_APP_API_URL=http://localhost:8000/api
```

## Key Features Implemented

### ✅ FoodHub (Dashboard)
- Stats cards (today's meals, leftovers, expiring items)
- Alerts section
- Expiring items preview

### ✅ Meals Screen
- Date picker for meal planning
- Create/edit/delete meals
- Meal type selection (Breakfast, Lunch, Dinner, Snack)
- Ingredient management

### ✅ Recipes Screen
- Search/filter recipes
- Create new recipes with metadata
- Delete recipes
- View recipe details (click to open RecipeDetail)

### ✅ Recipe Detail Screen
- Edit recipe metadata
- Add/remove ingredients
- Add/remove cooking steps
- Scale recipe by serving size (auto-calculates ingredient quantities)

### ✅ Meal Suggestions Screen
- Generate AI suggestions (70%+ match minimum)
- View suggestion details with:
  - Match percentage
  - Reason for suggestion
  - Expiring items (priority)
  - Leftover items
  - Available ingredients
- Clear old suggestions
- "Plan This Meal" button (ready for integration)

### ✅ Leftovers Screen
- Tab navigation (All, Expiring, Expired)
- Create leftovers with expiry tracking
- Color-coded status:
  - Fresh (green, >3 days)
  - Expiring (yellow, 0-3 days)
  - Expired (red, <0 days)
- Delete leftovers

## Next Steps

### To Complete Implementation:

1. **Integration with Inventory Module**
   - When adding meal items, fetch inventory items
   - Automatic inventory deduction on meal preparation

2. **Recipe-to-Meal Mapping**
   - Click suggestion → Auto-populate meal with recipe ingredients
   - "Plan This Meal" button functionality

3. **Data Persistence**
   - Test with real backend API
   - Add loading skeletons
   - Error boundary components

4. **Enhanced UI**
   - Add recipe images
   - Ingredient unit conversion
   - Nutrition info display
   - Print meal plan / shopping list

5. **Mobile Optimization**
   - Responsive design refinement
   - Touch-friendly buttons
   - Mobile navigation patterns

## Testing Checklist

- [ ] FoodProvider wraps the app
- [ ] All screens render without errors
- [ ] API calls work with real backend
- [ ] Date picker filters meals correctly
- [ ] Recipe scaling calculates correctly
- [ ] Suggestions generate with proper ranking
- [ ] Leftover status colors update based on expiry
- [ ] Form validations work
- [ ] Error messages display properly
- [ ] Loading states work as expected

## Notes

- All components use placeholder styling - customize CSS in `/styles/food/` as needed
- Context state management is centralized in `FoodContext.jsx`
- All API calls are abstracted in service files for easy modification
- The base code follows the Flutter module architecture for consistency
