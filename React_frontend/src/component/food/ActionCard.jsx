import React from 'react';
import { AppColors } from '../../theme/colors';

/**
 * ActionCard - Quick action card for 3x3 grid
 * Used in FoodHub quick actions
 * 
 * Props:
 * - title: string (e.g., "Inventory")
 * - icon: React component or string
 * - color: string (hex color)
 * - onClick?: function (callback on click)
 */
const ActionCard = ({ title, icon: Icon, color, onClick }) => {
  return (
    <div
      onClick={onClick}
      style={{
        padding: '12px',
        backgroundColor: 'white',
        borderRadius: '16px',
        cursor: onClick ? 'pointer' : 'default',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '120px',
        aspectRatio: '1 / 1',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateY(-4px)';
          e.currentTarget.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.08)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.04)';
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          width: '48px',
          height: '48px',
          borderRadius: '14px',
          backgroundColor: `${color}1A`, // 10% opacity
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '8px',
        }}
      >
        {typeof Icon === 'string' ? (
          <span style={{ fontSize: '28px', color }}>{Icon}</span>
        ) : (
          React.cloneElement(Icon, { size: 28, color })
        )}
      </div>

      {/* Title */}
      <span
        style={{
          fontSize: '12px',
          fontWeight: 600,
          color: AppColors.textDark,
          textAlign: 'center',
          lineHeight: '1.3',
        }}
      >
        {title}
      </span>
    </div>
  );
};

export default ActionCard;
