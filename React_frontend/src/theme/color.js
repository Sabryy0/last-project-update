/**
 * Color palette matching Flutter app_color.dart
 * Exported for consistent theming across React components
 */

export const AppColors = {
  // ── Brand colors ──
  primaryColor: '#4CAF75',
  secondaryColor: '#CCBD7B',

  // ── Food‑module greens (the palette used across all food screens) ──
  foodPrimary: '#388E3C',
  foodPrimaryLight: '#4CAF50',
  foodPrimaryDark: '#1B5E20',
  foodBg: '#E8F5E9',
  foodCardBg: '#C8E6C9',
  foodAccent: '#66BB6A',

  // ── Neutral text ──
  textDark: '#2E3E33',
  textMedium: '#616161',
  textLight: '#9E9E9E',

  // ── Status / semantic ──
  error: '#F44336',
  warning: '#FF9800',
  info: '#2196F3',
  success: '#4CAF50',

  // ── Category card palette (10 colours, indexed) ──
  categoryColors: [
    '#4CAF50', // Green
    '#FF9800', // Orange
    '#2196F3', // Blue
    '#9C27B0', // Purple
    '#F44336', // Red
    '#00BCD4', // Cyan
    '#795548', // Brown
    '#E91E63', // Pink
    '#607D8B', // Blue-Grey
    '#FF5722', // Deep Orange
  ],
};

// ── Helper function to get category color by index ──
export const getCategoryColor = (index) => {
  return AppColors.categoryColors[index % AppColors.categoryColors.length];
};

// ── Predefined color for specific actions ──
export const ActionColors = {
  inventory: AppColors.foodPrimary,
  categories: '#795548',
  recipes: AppColors.warning,
  mealPlan: AppColors.info,
  groceries: '#00BCD4',
  leftovers: '#9C27B0',
  suggestions: '#E91E63',
  receipts: '#607D8B',
  alerts: AppColors.error,
};
