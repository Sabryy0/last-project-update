import React from 'react';
import { AlertCircle, Clock } from 'lucide-react';
import { AppColors } from '../../theme/colors';

/**
 * ExpiringCard - Card for expiring/expired leftover items
 * Used in FoodHub and LeftoversScreen
 * 
 * Props:
 * - name: string (item name)
 * - daysLeft: number (days until expiry, negative if expired)
 * - onClick?: function (callback on click)
 */
const ExpiringCard = ({ name, daysLeft, onClick }) => {
  const isExpired = daysLeft < 0;
  const isExpiresToday = daysLeft === 0;
  
  // Determine colors based on urgency
  let iconColor = AppColors.warning;
  let borderColor = AppColors.warning;
  let bgColor = AppColors.warning;
  let statusText = '';

  if (isExpired) {
    iconColor = AppColors.error;
    borderColor = AppColors.error;
    bgColor = AppColors.error;
    statusText = `Expired ${Math.abs(daysLeft)} day${Math.abs(daysLeft) === 1 ? '' : 's'} ago`;
  } else if (isExpiresToday) {
    statusText = 'Expires today!';
  } else {
    statusText = `Expires in ${daysLeft} day${daysLeft === 1 ? '' : 's'}`;
  }

  return (
    <div
      onClick={onClick}
      style={{
        marginBottom: '8px',
        padding: '14px',
        backgroundColor: 'white',
        borderRadius: '12px',
        border: `1px solid ${borderColor}4D`, // 30% opacity
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        display: 'flex',
        gap: '12px',
        alignItems: 'flex-start',
      }}
      onMouseEnter={(e) => {
        if (onClick) {
          e.currentTarget.style.transform = 'translateX(4px)';
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
        }
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateX(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Icon Container */}
      <div
        style={{
          width: '40px',
          height: '40px',
          borderRadius: '10px',
          backgroundColor: `${bgColor}1A`, // 10% opacity
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}
      >
        {isExpired ? (
          <AlertCircle size={20} color={iconColor} />
        ) : (
          <Clock size={20} color={iconColor} />
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Item Name */}
        <p
          style={{
            margin: '0 0 4px 0',
            fontSize: '14px',
            fontWeight: 600,
            color: AppColors.textDark,
            wordBreak: 'break-word',
          }}
        >
          {name}
        </p>

        {/* Status Text */}
        <p
          style={{
            margin: 0,
            fontSize: '12px',
            fontWeight: 500,
            color: iconColor,
          }}
        >
          {statusText}
        </p>
      </div>
    </div>
  );
};

export default ExpiringCard;
