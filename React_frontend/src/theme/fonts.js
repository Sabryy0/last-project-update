/**
 * Typography system matching Flutter app_fonts.dart and Google Fonts usage
 * Poppins is the primary font for UI elements
 * DMSerifText is used for serif/elegant elements
 */

export const AppFonts = {
  // Primary font family
  primary: "'Poppins', sans-serif",
  serif: "'DMSerifText', serif", // Fallback if not loaded

  // Font sizes
  sizes: {
    pageTitle: '26px', // "Food Hub"
    sectionHeader: '18px', // "Quick Actions"
    cardValue: '20px', // Large stat numbers
    label: '12px', // Card labels
    body: '12px', // Secondary info
    badge: '11px', // Status badges
    meta: '10px', // Timestamps
  },

  // Font weights
  weights: {
    bold: 700,
    semibold: 600,
    medium: 500,
    regular: 400,
  },

  // Predefined text styles
  styles: {
    pageTitle: {
      fontSize: '26px',
      fontWeight: 700,
      fontFamily: "'Poppins', sans-serif",
      color: '#2E3E33',
    },
    sectionHeader: {
      fontSize: '18px',
      fontWeight: 700,
      fontFamily: "'Poppins', sans-serif",
      color: '#2E3E33',
    },
    cardValue: {
      fontSize: '20px',
      fontWeight: 700,
      fontFamily: "'Poppins', sans-serif",
      color: '#2E3E33',
    },
    label: {
      fontSize: '12px',
      fontWeight: 600,
      fontFamily: "'Poppins', sans-serif",
      color: '#616161',
    },
    body: {
      fontSize: '12px',
      fontWeight: 500,
      fontFamily: "'Poppins', sans-serif",
      color: '#616161',
    },
    badge: {
      fontSize: '11px',
      fontWeight: 600,
      fontFamily: "'Poppins', sans-serif",
    },
  },
};
