const express = require('express');
const { protect, restrictTo } = require('../controllers/AuthController');
const {
	setConversionRate,
	getConversionRate,
	convertMoneyToPoints,
	convertPointsToMoney,
	getMemberCombinedBalance,
	getRedeemExpenses,
	createEventWithRewards,
	contributeToEvent,
	getEventFundingStatus,
	markContributionPaid,
	adjustFundingGoal,
	getCombinedAnalytics,
	createPeriodBudget,
	getPeriodBudgets,
	setPeriodBudgetAllocations,
	recordAllocationWithdrawal,
	getPeriodBudgetDetails,
	setPeriodMemberAllowances,
	getPeriodMemberAllowances,
} = require('../controllers/BudgetController');

const budgetRouter = express.Router();

budgetRouter.use(protect);

budgetRouter.post('/conversion-rate', restrictTo('Parent'), setConversionRate);
budgetRouter.get('/conversion-rate', getConversionRate);
budgetRouter.post('/wallet/convert-to-points', convertMoneyToPoints);
budgetRouter.post('/wallet/convert-from-points', convertPointsToMoney);
budgetRouter.get('/analytics', getCombinedAnalytics);
budgetRouter.get('/member/:memberId/combined-balance', getMemberCombinedBalance);
budgetRouter.get('/expenses/redeems', getRedeemExpenses);
budgetRouter.post('/future-events', restrictTo('Parent'), createEventWithRewards);
budgetRouter.post('/events/:eventId/contribute', contributeToEvent);
budgetRouter.get('/events/:eventId/funding', getEventFundingStatus);
budgetRouter.patch('/events/:eventId/mark-paid', restrictTo('Parent'), markContributionPaid);
budgetRouter.patch('/events/:eventId/funding-goal', restrictTo('Parent'), adjustFundingGoal);

// Flexible period budgeting (weekly/monthly/yearly/custom)
budgetRouter.post('/periods', restrictTo('Parent'), createPeriodBudget);
budgetRouter.get('/periods', restrictTo('Parent'), getPeriodBudgets);
budgetRouter.get('/periods/:periodBudgetId', restrictTo('Parent'), getPeriodBudgetDetails);
budgetRouter.put('/periods/:periodBudgetId/allocations', restrictTo('Parent'), setPeriodBudgetAllocations);
budgetRouter.put('/periods/:periodBudgetId/allowances', restrictTo('Parent'), setPeriodMemberAllowances);
budgetRouter.get('/periods/:periodBudgetId/allowances', restrictTo('Parent'), getPeriodMemberAllowances);

// Withdrawal tracking against allocations with parent notifications
budgetRouter.post('/allocations/:allocationId/withdrawals', recordAllocationWithdrawal);

module.exports = budgetRouter;
