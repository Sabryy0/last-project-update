import React, { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useFood } from '../../context/FoodContext';
import ExpiringCard from '../../components/food/ExpiringCard';
import { AppColors } from '../../theme/colors';
import '../../styles/food/Leftovers.css';

/**
 * Leftovers Screen - Expiry tracking with tabs
 * Matches Flutter LeftoversScreen exactly
 * Features: 
 * - 3 tabs: All / Expiring Soon (0-3 days) / Expired
 * - Status visualization with color coding
 * - Summary badge showing counts
 */
const Leftovers = ({ familyId, goToScreen }) => {
  const { leftovers, fetchLeftovers, loading, error } = useFood();
  const [activeTab, setActiveTab] = useState(0); // 0: All, 1: Expiring Soon, 2: Expired
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    if (familyId) {
      fetchLeftovers(familyId);
    }
  }, [familyId, fetchLeftovers]);

  // Get days left for item
  const getDaysLeft = (item) => {
    if (item.days_to_expiry !== undefined) return item.days_to_expiry;
    if (item.expiry_date) {
      const expiryDate = new Date(item.expiry_date);
      const today = new Date();
      return Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Filter leftovers based on active tab
  const getFilteredLeftovers = () => {
    if (!leftovers) return [];

    const now = new Date();
    switch (activeTab) {
      case 1: // Expiring Soon (0-3 days)
        return leftovers.filter((item) => {
          const daysLeft = getDaysLeft(item);
          return daysLeft >= 0 && daysLeft <= 3;
        });
      case 2: // Expired
        return leftovers.filter((item) => {
          const daysLeft = getDaysLeft(item);
          return daysLeft < 0;
        });
      default: // All
        return leftovers;
    }
  };

  const allLeftovers = getFilteredLeftovers();
  const expiringCount = leftovers?.filter((item) => {
    const daysLeft = getDaysLeft(item);
    return daysLeft >= 0 && daysLeft <= 3;
  })?.length || 0;
  const expiredCount = leftovers?.filter((item) => {
    return getDaysLeft(item) < 0;
  })?.length || 0;

  const handleRefresh = async () => {
    setIsRefreshing(true);
    if (familyId) {
      await fetchLeftovers(familyId);
    }
    setIsRefreshing(false);
  };

  const handleBack = () => {
    if (goToScreen) {
      goToScreen('hub');
    } else {
      window.history.back();
    }
  };

  return (
    <div className="leftovers-screen">
      {/* Header */}
      <div className="leftovers-header">
        <button className="back-button" onClick={handleBack}>
          <div className="back-button-icon">
            <ArrowLeft size={18} color={AppColors.foodPrimary} />
          </div>
        </button>

        <h1 className="leftovers-title">Leftover Tracker</h1>

        {/* Summary Badge */}
        <div className="summary-badge">
          {leftovers?.length || 0}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="error-banner">
          <p>{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading leftovers...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Tab Navigation */}
          <div className="tabs-container">
            <button
              className={`tab ${activeTab === 0 ? 'active' : ''}`}
              onClick={() => setActiveTab(0)}
            >
              All
            </button>
            <button
              className={`tab ${activeTab === 1 ? 'active' : ''}`}
              onClick={() => setActiveTab(1)}
            >
              Expiring Soon
              <span className="tab-badge">{expiringCount}</span>
            </button>
            <button
              className={`tab ${activeTab === 2 ? 'active' : ''}`}
              onClick={() => setActiveTab(2)}
            >
              Expired
              <span className="tab-badge">{expiredCount}</span>
            </button>
          </div>

          {/* Leftovers List */}
          <div className="leftovers-list">
            {allLeftovers.length > 0 ? (
              allLeftovers.map((item) => (
                <ExpiringCard
                  key={item._id || item.id}
                  name={item.name}
                  daysLeft={getDaysLeft(item)}
                />
              ))
            ) : (
              <div className="empty-state">
                <p>
                  {activeTab === 0 && 'No leftovers tracked yet'}
                  {activeTab === 1 && 'No items expiring soon'}
                  {activeTab === 2 && 'No expired items'}
                </p>
              </div>
            )}
          </div>

          {/* Spacing for bottom nav */}
          <div style={{ height: '80px' }}></div>
        </>
      )}
    </div>
  );
};


export default Leftovers;
