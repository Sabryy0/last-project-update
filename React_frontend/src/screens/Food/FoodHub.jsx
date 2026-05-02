import React, { useState, useEffect } from 'react';
import {
  Home, Users, Calendar, MessageCircle, Settings, MapPin, Shield,
  LogOut, Bell, Inbox, BookOpen, Home as HomeIcon, Calendar as MealIcon,
  ShoppingCart, Leaf, Lightbulb, Receipt, AlertCircle, ClipboardList
} from 'lucide-react';
import { useFood } from '../../context/FoodContext';
import StatCard from '../../components/food/StatCard';
import ActionCard from '../../components/food/ActionCard';
import ExpiringCard from '../../components/food/ExpiringCard';
import { AppColors } from '../../theme/colors';
import { ActionColors } from '../../theme/colors';
import '../../styles/food/FoodHub.css';

/**
 * FoodHub Screen - Main dashboard for food management
 * Matches Flutter FoodHubScreen exactly
 * 
 * Features:
 * - Header with family title + alerts bell
 * - Stats row (3 cards: Inventory, Recipes, Leftovers)
 * - Quick actions grid (3x3)
 * - Expiring soon preview section
 */
const FoodHub = ({ familyId, goToScreen }) => {
  const { meals, leftovers, fetchMeals, fetchLeftovers, loading, error } = useFood();
  const [familyTitle, setFamilyTitle] = useState('My Family');
  const [unreadAlerts, setUnreadAlerts] = useState(0);
  const [expiringList, setExpiringList] = useState([]);
  const [totalItems, setTotalItems] = useState(0);
  const [lowStockCount, setLowStockCount] = useState(0);
  const [totalRecipes, setTotalRecipes] = useState(0);
  const [totalLeftovers, setTotalLeftovers] = useState(0);
  const [expiringLeftovers, setExpiringLeftovers] = useState(0);

  // Load family data and compute stats
  useEffect(() => {
    // Get family title from localStorage
    const storedFamilyTitle = localStorage.getItem('familyTitle') || 'My Family';
    setFamilyTitle(storedFamilyTitle);

    // Fetch data if familyId changes
    if (familyId) {
      const today = new Date().toISOString().split('T')[0];
      fetchMeals(familyId, today, today);
      fetchLeftovers(familyId);
    }
  }, [familyId, fetchMeals, fetchLeftovers]);

  // Compute stats from data
  useEffect(() => {
    if (!loading) {
      // Calculate total items and low stock (mock - would come from API)
      setTotalItems(leftovers?.length || 0);
      setLowStockCount(0); // Would calculate from inventory API

      // Count recipes
      setTotalRecipes(meals?.length || 0);

      // Count leftovers
      setTotalLeftovers(leftovers?.length || 0);

      // Count expiring (within 3 days)
      const expiringCount = leftovers?.filter((l) => {
        const daysLeft = l.days_to_expiry;
        return daysLeft >= 0 && daysLeft <= 3;
      })?.length || 0;
      setExpiringLeftovers(expiringCount);

      // Get top 4 expiring items
      const expiring = leftovers
        ?.filter((l) => l.days_to_expiry >= 0)
        ?.sort((a, b) => a.days_to_expiry - b.days_to_expiry)
        ?.slice(0, 4) || [];
      setExpiringList(expiring);

      // Mock: Set unread alerts
      setUnreadAlerts(expiringCount > 0 ? Math.min(expiringCount, 9) : 0);
    }
  }, [loading, meals, leftovers]);

  // Calculate days left for a leftover item
  const getDaysLeft = (item) => {
    if (item.days_to_expiry !== undefined) return item.days_to_expiry;
    if (item.expiry_date) {
      const expiryDate = new Date(item.expiry_date);
      const today = new Date();
      return Math.floor((expiryDate - today) / (1000 * 60 * 60 * 24));
    }
    return 0;
  };

  // Navigation handler
  const handleNavigate = (screen) => {
    if (goToScreen) {
      goToScreen(screen);
    }
  };

  // Handle refresh
  const handleRefresh = async () => {
    if (familyId) {
      const today = new Date().toISOString().split('T')[0];
      await Promise.all([
        fetchMeals(familyId, today, today),
        fetchLeftovers(familyId)
      ]);
    }
  };

  return (
    <div className="food-hub-screen">
      {/* Loading State */}
      {loading && (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      )}

      {!loading && (
        <>
          {/* Header */}
          <div className="food-hub-header">
            <div className="header-title-group">
              <p className="header-subtitle">{familyTitle}'s Kitchen</p>
              <h1 className="header-title">Food Hub</h1>
            </div>

            {/* Alerts Bell with Badge */}
            <div className="alerts-bell-container">
              <button
                className="alerts-bell-btn"
                onClick={() => handleNavigate('alerts')}
                title="View alerts"
              >
                <Bell size={28} color={AppColors.foodPrimary} />
                {unreadAlerts > 0 && (
                  <span className="badge">
                    {unreadAlerts > 9 ? '9+' : unreadAlerts}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="error-banner">
              <AlertCircle size={18} />
              <p>{error}</p>
            </div>
          )}

          {/* Stats Row - 3 Cards */}
          <div className="stats-row">
            <StatCard
              label="Inventory"
              value={totalItems}
              icon={<Inbox size={22} />}
              color={AppColors.foodPrimary}
              badge={lowStockCount > 0 ? `${lowStockCount} low` : null}
              badgeColor={AppColors.error}
              onClick={() => handleNavigate('inventory')}
            />
            <StatCard
              label="Recipes"
              value={totalRecipes}
              icon={<BookOpen size={22} />}
              color={AppColors.warning}
              onClick={() => handleNavigate('recipes')}
            />
            <StatCard
              label="Leftovers"
              value={totalLeftovers}
              icon={<Leaf size={22} />}
              color={AppColors.info}
              badge={expiringLeftovers > 0 ? `${expiringLeftovers} exp.` : null}
              badgeColor={AppColors.warning}
              onClick={() => handleNavigate('leftovers')}
            />
          </div>

          {/* Quick Actions Grid - 3x3 */}
          <div className="quick-actions-section">
            <h2 className="quick-actions-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <ActionCard
                title="Inventory"
                icon={<Inbox size={28} />}
                color={ActionColors.inventory}
                onClick={() => handleNavigate('inventory')}
              />
              <ActionCard
                title="Categories"
                icon={<ClipboardList size={28} />}
                color={ActionColors.categories}
                onClick={() => handleNavigate('categories')}
              />
              <ActionCard
                title="Recipes"
                icon={<BookOpen size={28} />}
                color={ActionColors.recipes}
                onClick={() => handleNavigate('recipes')}
              />
              <ActionCard
                title="Meal Plan"
                icon={<MealIcon size={28} />}
                color={ActionColors.mealPlan}
                onClick={() => handleNavigate('meals')}
              />
              <ActionCard
                title="Groceries"
                icon={<ShoppingCart size={28} />}
                color={ActionColors.groceries}
                onClick={() => handleNavigate('groceries')}
              />
              <ActionCard
                title="Leftovers"
                icon={<Leaf size={28} />}
                color={ActionColors.leftovers}
                onClick={() => handleNavigate('leftovers')}
              />
              <ActionCard
                title="Suggestions"
                icon={<Lightbulb size={28} />}
                color={ActionColors.suggestions}
                onClick={() => handleNavigate('suggestions')}
              />
              <ActionCard
                title="Receipts"
                icon={<Receipt size={28} />}
                color={ActionColors.receipts}
                onClick={() => handleNavigate('receipts')}
              />
              <ActionCard
                title="Alerts"
                icon={<AlertCircle size={28} />}
                color={ActionColors.alerts}
                onClick={() => handleNavigate('alerts')}
              />
            </div>
          </div>

          {/* Expiring Soon Section */}
          {expiringList.length > 0 && (
            <div className="expiring-section">
              <div className="expiring-section-header">
                <h2 className="expiring-section-title">Expiring Soon</h2>
                <button
                  className="view-all-btn"
                  onClick={() => handleNavigate('leftovers')}
                >
                  View All
                </button>
              </div>
              <div className="expiring-list">
                {expiringList.map((item) => (
                  <ExpiringCard
                    key={item._id || item.id}
                    name={item.name}
                    daysLeft={getDaysLeft(item)}
                    onClick={() => handleNavigate('leftovers')}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Spacing for bottom nav */}
          <div style={{ height: '80px' }}></div>
        </>
      )}
    </div>
  );
};

export default FoodHub;

