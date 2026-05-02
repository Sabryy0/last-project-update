import React from 'react';
import { AppColors } from '../../theme/colors';
import { AppFonts } from '../../theme/fonts';

/**
 * StatCard - Reusable stat display card
 * Used in FoodHub for Inventory, Recipes, Leftovers stats
 * 
 * Props:
 * - label: string (e.g., "Inventory")
 * - value: string or number (e.g., "42")
 * - icon: React component or string
 * - color: string (hex color)
 * - badge?: string (optional badge text)
 * - badgeColor?: string (optional badge color)
 * - onClick?: function (callback on click)
 */
const StatCard = ({ label, value, icon: Icon, color, badge, badgeColor, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '14px',
        backgroundColor: 'white',
        borderRadius: '16px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        if (onClick) e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${color}1A`, // 10% opacity
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '10px',
        }}
      >
        {typeof Icon === 'string' ? (
          <span style={{ fontSize: '22px', color }}>{Icon}</span>
        ) : (
          React.cloneElement(Icon, { size: 22, color })
        )}
      </div>

      {/* Label */}
      <span
        style={{
          fontSize: '12px',
          color: AppColors.textMedium,
          fontWeight: 500,
          marginBottom: '4px',
        }}
      >
        {label}
      </span>

      {/* Value */}
      <span
        style={{
          fontSize: '20px',
          fontWeight: 700,
          color: AppColors.textDark,
          marginBottom: badge ? '2px' : '0',
        }}
      >
        {value}
      </span>

      {/* Badge */}
      {badge && (
        <span
          style={{
            fontSize: '11px',
            fontWeight: 600,
            color: badgeColor || AppColors.textLight,
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );
};

export default StatCard;
