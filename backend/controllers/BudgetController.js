const mongoose = require('mongoose');
const nodemailer = require('nodemailer');
const AppError = require('../utils/appError');
const { catchAsync } = require('../utils/catchAsync');
const ConversionRate = require('../models/conversionRateModel');
const MemberWallet = require('../models/memberWalletModel');
const PointWallet = require('../models/point_walletModel');
const PointHistory = require('../models/point_historyModel');
const Member = require('../models/MemberModel');
const Budget = require('../models/budgetModel');
const Expense = require('../models/ExpenseModel');
const FutureEvent = require('../models/futureEventModel');
const Wishlist = require('../models/wishlistModel');
const WishlistItem = require('../models/wishlist_itemModel');
const WishlistCategory = require('../models/wishlist_categoryModel');
const WalletTransaction = require('../models/walletTransactionModel');
const MemberType = require('../models/MemberTypeModel');
const Redeem = require('../models/redeemModel');
const MemberAllowance = require('../models/memberAllowanceModel');
const PeriodBudget = require('../models/periodBudgetModel');
const BudgetAllocation = require('../models/budgetAllocationModel');
const InventoryCategory = require('../models/inventoryCategoryModel');

const DEFAULT_MONEY_TO_POINTS_RATE = 10;
const DEFAULT_POINTS_TO_MONEY_RATE = 0.05;

const getActiveConversionRate = async (familyId) => {
	const conversionRate = await ConversionRate.findOne({
		family_id: familyId,
		is_active: true,
	}).sort({ updated_at: -1, created_at: -1 });

	if (!conversionRate) {
		return {
			money_to_points_rate: DEFAULT_MONEY_TO_POINTS_RATE,
			points_to_money_rate: DEFAULT_POINTS_TO_MONEY_RATE,
			is_active: true,
			source: 'default',
		};
	}

	return conversionRate;
};

const ensureMoneyWallet = async (memberMail, familyId) => {
	let wallet = await MemberWallet.findOne({ member_mail: memberMail, family_id: familyId });

	if (!wallet) {
		wallet = await MemberWallet.create({
			member_mail: memberMail,
			family_id: familyId,
			balance: 0,
		});
	}

	return wallet;
};

const ensurePointWallet = async (memberMail, familyId) => {
	let wallet = await PointWallet.findOne({ member_mail: memberMail, family_id: familyId });

	if (!wallet) {
		wallet = await PointWallet.create({
			member_mail: memberMail,
			family_id: familyId,
			total_points: 0,
		});
	}

	return wallet;
};

const getFamilyParents = async (familyId) => {
	const members = await Member.find({ family_id: familyId })
		.populate('member_type_id', 'type')
		.select('mail username member_type_id');

	return members.filter((member) => member.member_type_id?.type === 'Parent');
};

const sendParentNotification = async (familyId, subject, text, html) => {
	const parents = await getFamilyParents(familyId);
	const recipientEmails = parents.map((parent) => parent.mail).filter(Boolean);

	if (recipientEmails.length === 0) {
		return { sent: false, recipients: [] };
	}

	const emailUser = process.env.EMAIL_USERNAME || process.env.EMAIL_USER;
	const emailPass = process.env.EMAIL_PASSWORD || process.env.EMAIL_PASS;

	if (!emailUser || !emailPass) {
		return { sent: false, recipients: recipientEmails, reason: 'email credentials are not configured' };
	}

	const transporter = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: emailUser,
			pass: emailPass,
		},
	});

	await transporter.sendMail({
		from: emailUser,
		to: recipientEmails,
		subject,
		text,
		html: html || text,
	});

	return { sent: true, recipients: recipientEmails };
};

const getRewardsBudget = async (familyId) => {
	return Budget.findOne({ family_id: familyId, category_name: 'Rewards', is_active: true });
};

const computeUsagePercentage = (spent, total) => {
	if (!Number.isFinite(total) || total <= 0) return 0;
	return Number(Math.min(100, ((spent / total) * 100)).toFixed(2));
};

const computeRemaining = (total, spent) => {
	return Number(Math.max(0, (Number(total || 0) - Number(spent || 0))).toFixed(2));
};

const recalcPeriodSpent = async (periodBudgetId) => {
	const aggregate = await BudgetAllocation.aggregate([
		{ $match: { period_budget_id: periodBudgetId, is_active: true } },
		{ $group: { _id: null, totalSpent: { $sum: '$spent_amount' } } },
	]);

	const totalSpent = Number(aggregate[0]?.totalSpent || 0);
	await PeriodBudget.findByIdAndUpdate(periodBudgetId, { $set: { spent_amount: Number(totalSpent.toFixed(2)) } });
	return totalSpent;
};

exports.createPeriodBudget = catchAsync(async (req, res, next) => {
	const {
		title,
		period_type,
		start_date,
		end_date,
		total_amount,
		currency,
		threshold_percentage,
	} = req.body;

	if (!title || !period_type || !start_date || !end_date || total_amount === undefined) {
		return next(new AppError('Please provide title, period_type, start_date, end_date and total_amount', 400));
	}

	if (!['weekly', 'monthly', 'yearly', 'custom'].includes(period_type)) {
		return next(new AppError('period_type must be weekly, monthly, yearly, or custom', 400));
	}

	const totalAmount = Number(total_amount);
	if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
		return next(new AppError('total_amount must be a positive number', 400));
	}

	const startDate = new Date(start_date);
	const endDate = new Date(end_date);
	if (Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
		return next(new AppError('start_date and end_date must be valid dates', 400));
	}

	if (endDate < startDate) {
		return next(new AppError('end_date must be greater than or equal to start_date', 400));
	}

	const threshold = threshold_percentage === undefined ? 15 : Number(threshold_percentage);
	if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
		return next(new AppError('threshold_percentage must be between 0 and 100', 400));
	}

	const periodBudget = await PeriodBudget.create({
		family_id: req.familyAccount._id,
		title,
		period_type,
		start_date: startDate,
		end_date: endDate,
		total_amount: totalAmount,
		currency: currency || 'EGP',
		threshold_percentage: threshold,
		created_by: req.member._id,
	});

	res.status(201).json({
		status: 'success',
		message: 'Period budget created successfully',
		data: {
			period_budget: periodBudget,
			remaining_amount: computeRemaining(periodBudget.total_amount, periodBudget.spent_amount),
			usage_percentage: computeUsagePercentage(periodBudget.spent_amount, periodBudget.total_amount),
		},
	});
});

exports.getPeriodBudgets = catchAsync(async (req, res, next) => {
	const { include_inactive, active_on } = req.query;
	const filter = {
		family_id: req.familyAccount._id,
	};

	if (include_inactive !== 'true') {
		filter.is_active = true;
	}

	if (active_on) {
		const activeDate = new Date(active_on);
		if (Number.isNaN(activeDate.getTime())) {
			return next(new AppError('active_on must be a valid date', 400));
		}

		filter.start_date = { $lte: activeDate };
		filter.end_date = { $gte: activeDate };
	}

	const periodBudgets = await PeriodBudget.find(filter).sort({ start_date: -1, createdAt: -1 });
	const periodIds = periodBudgets.map((item) => item._id);

	const allocations = await BudgetAllocation.find({
		family_id: req.familyAccount._id,
		period_budget_id: { $in: periodIds },
		is_active: true,
	}).populate('inventory_category_id', 'title');

	const allocationsByPeriod = new Map();
	for (const allocation of allocations) {
		const key = allocation.period_budget_id.toString();
		if (!allocationsByPeriod.has(key)) allocationsByPeriod.set(key, []);
		allocationsByPeriod.get(key).push(allocation);
	}

	const enriched = periodBudgets.map((budget) => {
		const periodAllocations = allocationsByPeriod.get(budget._id.toString()) || [];
		const totalAllocated = periodAllocations.reduce((sum, item) => sum + Number(item.allocated_amount || 0), 0);

		return {
			...budget.toObject(),
			allocation_count: periodAllocations.length,
			total_allocated: Number(totalAllocated.toFixed(2)),
			remaining_amount: computeRemaining(budget.total_amount, budget.spent_amount),
			usage_percentage: computeUsagePercentage(budget.spent_amount, budget.total_amount),
			allocations: periodAllocations,
		};
	});

	res.status(200).json({
		status: 'success',
		results: enriched.length,
		data: { period_budgets: enriched },
	});
});

exports.setPeriodBudgetAllocations = catchAsync(async (req, res, next) => {
	const { periodBudgetId } = req.params;
	const { allocations } = req.body;

	if (!mongoose.Types.ObjectId.isValid(periodBudgetId)) {
		return next(new AppError('Invalid period budget ID', 400));
	}

	if (!Array.isArray(allocations) || allocations.length === 0) {
		return next(new AppError('Please provide allocations array', 400));
	}

	const periodBudget = await PeriodBudget.findOne({
		_id: periodBudgetId,
		family_id: req.familyAccount._id,
		is_active: true,
	});

	if (!periodBudget) {
		return next(new AppError('Period budget not found', 404));
	}

	let requestedTotal = 0;
	const categoryIds = [];
	const normalizedAllocations = allocations.map((entry) => {
		const categoryId = entry.inventory_category_id;
		const amount = Number(entry.allocated_amount);
		const threshold = entry.threshold_percentage === undefined ? periodBudget.threshold_percentage : Number(entry.threshold_percentage);

		if (!mongoose.Types.ObjectId.isValid(categoryId)) {
			throw new AppError('Invalid inventory_category_id in allocations', 400);
		}

		if (!Number.isFinite(amount) || amount < 0) {
			throw new AppError('allocated_amount must be a non-negative number', 400);
		}

		if (!Number.isFinite(threshold) || threshold < 0 || threshold > 100) {
			throw new AppError('threshold_percentage must be between 0 and 100', 400);
		}

		requestedTotal += amount;
		categoryIds.push(categoryId);

		return {
			inventory_category_id: categoryId,
			allocated_amount: Number(amount.toFixed(2)),
			threshold_percentage: Number(threshold.toFixed(2)),
		};
	});

	if (requestedTotal > Number(periodBudget.total_amount || 0)) {
		return next(new AppError('Total allocation cannot exceed period total_amount', 400));
	}

	const categories = await InventoryCategory.find({ _id: { $in: categoryIds } }).select('_id');
	if (categories.length !== new Set(categoryIds.map((id) => id.toString())).size) {
		return next(new AppError('One or more inventory categories were not found', 404));
	}

	for (const item of normalizedAllocations) {
		await BudgetAllocation.findOneAndUpdate(
			{
				family_id: req.familyAccount._id,
				period_budget_id: periodBudget._id,
				inventory_category_id: item.inventory_category_id,
			},
			{
				$set: {
					allocated_amount: item.allocated_amount,
					threshold_percentage: item.threshold_percentage,
					is_active: true,
				},
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
	}

	await BudgetAllocation.updateMany(
		{
			family_id: req.familyAccount._id,
			period_budget_id: periodBudget._id,
			inventory_category_id: { $nin: categoryIds },
		},
		{ $set: { is_active: false } }
	);

	await recalcPeriodSpent(periodBudget._id);

	const updatedAllocations = await BudgetAllocation.find({
		family_id: req.familyAccount._id,
		period_budget_id: periodBudget._id,
		is_active: true,
	}).populate('inventory_category_id', 'title');

	res.status(200).json({
		status: 'success',
		message: 'Budget allocations updated successfully',
		data: {
			period_budget_id: periodBudget._id,
			allocations: updatedAllocations,
			total_allocated: Number(updatedAllocations.reduce((sum, item) => sum + Number(item.allocated_amount || 0), 0).toFixed(2)),
		},
	});
});

exports.recordAllocationWithdrawal = catchAsync(async (req, res, next) => {
	const { allocationId } = req.params;
	const { amount, description, expense_date, paid_by_member_id, receipt_url } = req.body;

	if (!mongoose.Types.ObjectId.isValid(allocationId)) {
		return next(new AppError('Invalid allocation ID', 400));
	}

	const normalizedAmount = Number(amount);
	if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
		return next(new AppError('amount must be a positive number', 400));
	}

	const allocation = await BudgetAllocation.findOne({
		_id: allocationId,
		family_id: req.familyAccount._id,
		is_active: true,
	}).populate('inventory_category_id', 'title');

	if (!allocation) {
		return next(new AppError('Allocation not found', 404));
	}

	const periodBudget = await PeriodBudget.findOne({
		_id: allocation.period_budget_id,
		family_id: req.familyAccount._id,
		is_active: true,
	});

	if (!periodBudget) {
		return next(new AppError('Linked period budget not found', 404));
	}

	const allocationRemaining = computeRemaining(allocation.allocated_amount, allocation.spent_amount);
	if (allocationRemaining < normalizedAmount) {
		return next(new AppError('Insufficient allocated amount for this category', 400));
	}

	let expenseOwner = req.member;
	if (paid_by_member_id) {
		if (!mongoose.Types.ObjectId.isValid(paid_by_member_id)) {
			return next(new AppError('Invalid paid_by_member_id', 400));
		}

		expenseOwner = await Member.findOne({ _id: paid_by_member_id, family_id: req.familyAccount._id });
		if (!expenseOwner) {
			return next(new AppError('paid_by_member_id not found in this family', 404));
		}
	}

	allocation.spent_amount = Number((Number(allocation.spent_amount || 0) + normalizedAmount).toFixed(2));
	await allocation.save();

	const periodSpent = await recalcPeriodSpent(periodBudget._id);

	const expense = await Expense.create({
		family_id: req.familyAccount._id,
		member_id: expenseOwner._id,
		member_mail: expenseOwner.mail,
		category: allocation.inventory_category_id?.title || 'Inventory Category',
		title: description || 'Inventory category withdrawal',
		description: description || 'Withdrawal from category allocation',
		amount: normalizedAmount,
		expense_date: expense_date ? new Date(expense_date) : new Date(),
		expense_source: 'budget',
		notes: `allocation_id=${allocation._id};period_budget_id=${periodBudget._id};receipt_url=${receipt_url || ''}`,
		is_finalized: true,
		finalized_at: new Date(),
	});

	const remainingAfter = computeRemaining(allocation.allocated_amount, allocation.spent_amount);
	const remainingPercentage = allocation.allocated_amount > 0
		? Number(((remainingAfter / allocation.allocated_amount) * 100).toFixed(2))
		: 0;

	const lowThresholdReached = remainingPercentage <= Number(allocation.threshold_percentage || 0);

	const alertText = lowThresholdReached
		? `Warning: ${allocation.inventory_category_id?.title || 'Category'} allocation is low. Remaining ${remainingAfter.toFixed(2)}.`
		: null;

	const withdrawalText = `${expenseOwner.username || expenseOwner.mail} recorded a withdrawal of ${normalizedAmount.toFixed(2)} from ${allocation.inventory_category_id?.title || 'category'}.`;

	const notification = await sendParentNotification(
		req.familyAccount._id,
		lowThresholdReached ? 'Budget withdrawal and low allocation warning' : 'Budget withdrawal recorded',
		lowThresholdReached ? `${withdrawalText} ${alertText}` : withdrawalText
	).catch((error) => ({ sent: false, recipients: [], error: error.message }));

	res.status(201).json({
		status: 'success',
		message: 'Withdrawal recorded successfully',
		data: {
			expense,
			allocation: {
				...allocation.toObject(),
				remaining_amount: remainingAfter,
				remaining_percentage: remainingPercentage,
				low_threshold_reached: lowThresholdReached,
			},
			period_budget: {
				...periodBudget.toObject(),
				spent_amount: Number(periodSpent.toFixed(2)),
				remaining_amount: computeRemaining(periodBudget.total_amount, periodSpent),
				usage_percentage: computeUsagePercentage(periodSpent, periodBudget.total_amount),
			},
			alert: lowThresholdReached ? alertText : null,
			notification,
		},
	});
});

exports.getPeriodBudgetDetails = catchAsync(async (req, res, next) => {
	const { periodBudgetId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(periodBudgetId)) {
		return next(new AppError('Invalid period budget ID', 400));
	}

	const periodBudget = await PeriodBudget.findOne({
		_id: periodBudgetId,
		family_id: req.familyAccount._id,
	});

	if (!periodBudget) {
		return next(new AppError('Period budget not found', 404));
	}

	const allocations = await BudgetAllocation.find({
		family_id: req.familyAccount._id,
		period_budget_id: periodBudget._id,
		is_active: true,
	}).populate('inventory_category_id', 'title');

	const allocationDetails = allocations.map((allocation) => {
		const remainingAmount = computeRemaining(allocation.allocated_amount, allocation.spent_amount);
		const remainingPercentage = allocation.allocated_amount > 0
			? Number(((remainingAmount / allocation.allocated_amount) * 100).toFixed(2))
			: 0;

		return {
			...allocation.toObject(),
			remaining_amount: remainingAmount,
			remaining_percentage: remainingPercentage,
			low_threshold_reached: remainingPercentage <= Number(allocation.threshold_percentage || 0),
		};
	});

	res.status(200).json({
		status: 'success',
		data: {
			period_budget: {
				...periodBudget.toObject(),
				remaining_amount: computeRemaining(periodBudget.total_amount, periodBudget.spent_amount),
				usage_percentage: computeUsagePercentage(periodBudget.spent_amount, periodBudget.total_amount),
			},
			allocations: allocationDetails,
		},
	});
});

exports.setPeriodMemberAllowances = catchAsync(async (req, res, next) => {
	const { periodBudgetId } = req.params;
	const { allowances } = req.body;

	if (!mongoose.Types.ObjectId.isValid(periodBudgetId)) {
		return next(new AppError('Invalid period budget ID', 400));
	}

	if (!Array.isArray(allowances)) {
		return next(new AppError('Please provide allowances array', 400));
	}

	const periodBudget = await PeriodBudget.findOne({
		_id: periodBudgetId,
		family_id: req.familyAccount._id,
		is_active: true,
	});

	if (!periodBudget) {
		return next(new AppError('Period budget not found', 404));
	}

	const normalizedAllowances = [];
	for (const entry of allowances) {
		const memberId = entry.member_id;
		const memberMail = entry.member_mail;
		const moneyAmount = Number(entry.money_amount || 0);
		const allowanceCurrency = entry.allowance_currency || 'money';
		const periodType = entry.period_type || periodBudget.period_type;

		if (!memberMail || typeof memberMail !== 'string') {
			return next(new AppError('Each allowance must include member_mail', 400));
		}

		if (memberId && !mongoose.Types.ObjectId.isValid(memberId)) {
			return next(new AppError('Invalid member_id in allowances', 400));
		}

		if (allowanceCurrency !== 'money') {
			return next(new AppError('allowance_currency must be money', 400));
		}

		if (!Number.isFinite(moneyAmount) || moneyAmount < 0) {
			return next(new AppError('money_amount must be a non-negative number', 400));
		}

		normalizedAllowances.push({
			member_id: memberId || null,
			member_mail: memberMail,
			money_amount: moneyAmount,
			allowance_currency: allowanceCurrency,
			period_type: periodType,
			start_date: periodBudget.start_date,
			end_date: periodBudget.end_date,
			period_budget_id: periodBudget._id,
		});
	}

	for (const allowance of normalizedAllowances) {
		await MemberAllowance.findOneAndUpdate(
			{
				family_id: req.familyAccount._id,
				period_budget_id: periodBudget._id,
				member_mail: allowance.member_mail,
			},
			{
				$set: {
					member_id: allowance.member_id,
					money_amount: allowance.money_amount,
					allowance_currency: allowance.allowance_currency,
					period_type: allowance.period_type,
					start_date: allowance.start_date,
					end_date: allowance.end_date,
					period_budget_id: allowance.period_budget_id,
				},
			},
			{ upsert: true, new: true, setDefaultsOnInsert: true }
		);
	}

	const savedAllowances = await MemberAllowance.find({
		family_id: req.familyAccount._id,
		period_budget_id: periodBudget._id,
	}).sort({ createdAt: 1 });

	res.status(200).json({
		status: 'success',
		message: 'Member allowances saved successfully',
		data: { allowances: savedAllowances },
	});
});

exports.getPeriodMemberAllowances = catchAsync(async (req, res, next) => {
	const { periodBudgetId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(periodBudgetId)) {
		return next(new AppError('Invalid period budget ID', 400));
	}

	const allowances = await MemberAllowance.find({
		family_id: req.familyAccount._id,
		period_budget_id: periodBudgetId,
	}).sort({ createdAt: 1 });

	res.status(200).json({
		status: 'success',
		results: allowances.length,
		data: { allowances },
	});
});

exports.setConversionRate = catchAsync(async (req, res, next) => {
	const { money_to_points_rate, points_to_money_rate } = req.body;

	if (money_to_points_rate === undefined || points_to_money_rate === undefined) {
		return next(new AppError('Please provide money_to_points_rate and points_to_money_rate', 400));
	}

	const moneyRate = Number(money_to_points_rate);
	const pointsRate = Number(points_to_money_rate);

	if (!Number.isFinite(moneyRate) || moneyRate <= 0 || !Number.isFinite(pointsRate) || pointsRate <= 0) {
		return next(new AppError('Conversion rates must be positive numbers', 400));
	}

	await ConversionRate.updateMany(
		{ family_id: req.familyAccount._id, is_active: true },
		{ $set: { is_active: false } }
	);

	const conversionRate = await ConversionRate.create({
		family_id: req.familyAccount._id,
		money_to_points_rate: moneyRate,
		points_to_money_rate: pointsRate,
		is_active: true,
		created_by: req.member._id,
	});

	res.status(201).json({
		status: 'success',
		message: 'Conversion rate updated successfully',
		data: { conversionRate },
	});
});

exports.getConversionRate = catchAsync(async (req, res, next) => {
	const conversionRate = await getActiveConversionRate(req.familyAccount._id);

	res.status(200).json({
		status: 'success',
		data: { conversionRate },
	});
});

exports.convertMoneyToPoints = catchAsync(async (req, res, next) => {
	const { amount_money } = req.body;
	const amountMoney = Number(amount_money);

	if (!Number.isFinite(amountMoney) || amountMoney <= 0) {
		return next(new AppError('Please provide a valid amount_money', 400));
	}

	const conversionRate = await getActiveConversionRate(req.familyAccount._id);
	const memberWallet = await ensureMoneyWallet(req.member.mail, req.familyAccount._id);
	const pointWallet = await ensurePointWallet(req.member.mail, req.familyAccount._id);

	if (memberWallet.balance < amountMoney) {
		return next(new AppError('Insufficient money balance for conversion', 400));
	}

	const pointsAmount = Number((amountMoney * conversionRate.money_to_points_rate).toFixed(2));

	const previousMoneyBalance = memberWallet.balance;
	const previousPointsBalance = pointWallet.total_points;

	try {
		memberWallet.balance = Number((memberWallet.balance - amountMoney).toFixed(2));
		memberWallet.last_update = new Date();
		await memberWallet.save();

		pointWallet.total_points = Number((pointWallet.total_points + pointsAmount).toFixed(2));
		pointWallet.last_update = new Date();
		await pointWallet.save();

		const pointHistory = await PointHistory.create({
			wallet_id: pointWallet._id,
			member_mail: req.member.mail,
			family_id: req.familyAccount._id,
			points_amount: pointsAmount,
			reason_type: 'conversion',
			granted_by: req.member.mail,
			description: 'Converted from money',
		});

		const walletTransaction = await mongoose.models.WalletTransaction || require('../models/walletTransactionModel');
		const createdTransaction = await walletTransaction.create({
			family_id: req.familyAccount._id,
			member_mail: req.member.mail,
			member_wallet_id: memberWallet._id,
			amount: amountMoney,
			transaction_type: 'withdrawal',
			description: `Converted ${amountMoney} money to ${pointsAmount} points`,
			conversion_type: 'money_to_points',
			converted_amount: pointsAmount,
			conversion_rate: conversionRate.money_to_points_rate,
			linked_point_transaction_id: pointHistory._id,
		});

		const notification = await sendParentNotification(
			req.familyAccount._id,
			'Money to points conversion completed',
			`${req.member.username || req.member.mail} converted ${amountMoney} money into ${pointsAmount} points.`,
			`<p><strong>${req.member.username || req.member.mail}</strong> converted ${amountMoney} money into ${pointsAmount} points.</p>`
		).catch((error) => ({ sent: false, recipients: [], error: error.message }));

		res.status(200).json({
			status: 'success',
			message: 'Money converted to points successfully',
			data: {
				memberWallet,
				pointWallet,
				walletTransaction: createdTransaction,
				pointHistory,
				conversionRate,
				notification,
			},
		});
	} catch (error) {
		memberWallet.balance = previousMoneyBalance;
		memberWallet.last_update = new Date();
		await memberWallet.save();

		pointWallet.total_points = previousPointsBalance;
		pointWallet.last_update = new Date();
		await pointWallet.save();

		return next(error);
	}
});

exports.convertPointsToMoney = catchAsync(async (req, res, next) => {
	const { amount_points } = req.body;
	const amountPoints = Number(amount_points);

	if (!Number.isFinite(amountPoints) || amountPoints <= 0) {
		return next(new AppError('Please provide a valid amount_points', 400));
	}

	const conversionRate = await getActiveConversionRate(req.familyAccount._id);
	const memberWallet = await ensureMoneyWallet(req.member.mail, req.familyAccount._id);
	const pointWallet = await ensurePointWallet(req.member.mail, req.familyAccount._id);

	if (pointWallet.total_points < amountPoints) {
		return next(new AppError('Insufficient points balance for conversion', 400));
	}

	const moneyAmount = Number((amountPoints * conversionRate.points_to_money_rate).toFixed(2));

	const previousMoneyBalance = memberWallet.balance;
	const previousPointsBalance = pointWallet.total_points;

	try {
		pointWallet.total_points = Number((pointWallet.total_points - amountPoints).toFixed(2));
		pointWallet.last_update = new Date();
		await pointWallet.save();

		memberWallet.balance = Number((memberWallet.balance + moneyAmount).toFixed(2));
		memberWallet.last_update = new Date();
		await memberWallet.save();

		const pointHistory = await PointHistory.create({
			wallet_id: pointWallet._id,
			member_mail: req.member.mail,
			family_id: req.familyAccount._id,
			points_amount: -amountPoints,
			reason_type: 'conversion',
			granted_by: req.member.mail,
			description: 'Converted to money',
		});

		const walletTransaction = await mongoose.models.WalletTransaction || require('../models/walletTransactionModel');
		const createdTransaction = await walletTransaction.create({
			family_id: req.familyAccount._id,
			member_mail: req.member.mail,
			member_wallet_id: memberWallet._id,
			amount: moneyAmount,
			transaction_type: 'deposit',
			description: `Converted ${amountPoints} points to ${moneyAmount} money`,
			conversion_type: 'points_to_money',
			converted_amount: moneyAmount,
			conversion_rate: conversionRate.points_to_money_rate,
			linked_point_transaction_id: pointHistory._id,
		});

		const notification = await sendParentNotification(
			req.familyAccount._id,
			'Points to money conversion completed',
			`${req.member.username || req.member.mail} converted ${amountPoints} points into ${moneyAmount} money.`,
			`<p><strong>${req.member.username || req.member.mail}</strong> converted ${amountPoints} points into ${moneyAmount} money.</p>`
		).catch((error) => ({ sent: false, recipients: [], error: error.message }));

		res.status(200).json({
			status: 'success',
			message: 'Points converted to money successfully',
			data: {
				memberWallet,
				pointWallet,
				walletTransaction: createdTransaction,
				pointHistory,
				conversionRate,
				notification,
			},
		});
	} catch (error) {
		memberWallet.balance = previousMoneyBalance;
		memberWallet.last_update = new Date();
		await memberWallet.save();

		pointWallet.total_points = previousPointsBalance;
		pointWallet.last_update = new Date();
		await pointWallet.save();

		return next(error);
	}
});

exports.getMemberCombinedBalance = catchAsync(async (req, res, next) => {
	const { memberId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(memberId)) {
		return next(new AppError('Invalid member ID', 400));
	}

	const targetMember = await Member.findOne({
		_id: memberId,
		family_id: req.familyAccount._id,
	}).populate('member_type_id', 'type');

	if (!targetMember) {
		return next(new AppError('Member not found in your family', 404));
	}

	const requesterIsParent = req.member.member_type_id?.type === 'Parent';
	const requesterIsTarget = req.member._id.toString() === targetMember._id.toString();

	if (!requesterIsParent && !requesterIsTarget) {
		return next(new AppError('You do not have permission to view this balance', 403));
	}

	const [moneyWallet, pointWallet, conversionRate] = await Promise.all([
		ensureMoneyWallet(targetMember.mail, req.familyAccount._id),
		ensurePointWallet(targetMember.mail, req.familyAccount._id),
		getActiveConversionRate(req.familyAccount._id),
	]);

	const moneyBalance = Number(moneyWallet.balance || 0);
	const pointsBalance = Number(pointWallet.total_points || 0);

	const totalValueInMoney = Number((moneyBalance + (pointsBalance * conversionRate.points_to_money_rate)).toFixed(2));
	const totalValueInPoints = Number((pointsBalance + (moneyBalance * conversionRate.money_to_points_rate)).toFixed(2));

	res.status(200).json({
		status: 'success',
		data: {
			member: {
				memberId: targetMember._id,
				mail: targetMember.mail,
				username: targetMember.username,
			},
			money_balance: moneyBalance,
			points_balance: pointsBalance,
			total_value_in_money: totalValueInMoney,
			total_value_in_points: totalValueInPoints,
			conversionRate,
		},
	});
});

exports.getRedeemExpenses = catchAsync(async (req, res, next) => {
	const { start_date, end_date, member_id } = req.query;
	const filter = {
		family_id: req.familyAccount._id,
		expense_source: 'redeem_reward',
	};

	if (member_id) {
		if (!mongoose.Types.ObjectId.isValid(member_id)) {
			return next(new AppError('Invalid member ID', 400));
		}
		filter.member_id = member_id;
	}

	if (start_date || end_date) {
		filter.expense_date = {};
		if (start_date) {
			filter.expense_date.$gte = new Date(start_date);
		}
		if (end_date) {
			filter.expense_date.$lte = new Date(end_date);
		}
	}

	const expenses = await Expense.find(filter)
		.populate('member_id', 'username mail')
		.populate('linked_redeem_id')
		.sort({ expense_date: -1, createdAt: -1 });

	res.status(200).json({
		status: 'success',
		results: expenses.length,
		data: { expenses },
	});
});

exports.createEventWithRewards = catchAsync(async (req, res, next) => {
	const {
		title,
		description,
		event_date,
		estimated_cost,
		funding_source,
		required_points,
		members_contributing,
	} = req.body;

	if (!title || !event_date) {
		return next(new AppError('Please provide title and event_date', 400));
	}

	const normalizedFundingSource = funding_source || 'budget';
	const normalizedRequiredPoints = Number(required_points || 0);
	const estimatedCost = Number(estimated_cost || 0);

	if (!Number.isFinite(normalizedRequiredPoints) || normalizedRequiredPoints < 0) {
		return next(new AppError('required_points must be a non-negative number', 400));
	}

	if (!Number.isFinite(estimatedCost) || estimatedCost < 0) {
		return next(new AppError('estimated_cost must be a non-negative number', 400));
	}

	let normalizedContributors = [];
	if (normalizedFundingSource === 'member_contributions') {
		if (!Array.isArray(members_contributing) || members_contributing.length === 0) {
			return next(new AppError('members_contributing is required when funding_source is member_contributions', 400));
		}

		normalizedContributors = members_contributing.map((entry) => ({
			member_id: entry.member_id,
			amount_promised: Number(entry.amount_promised || 0),
			amount_paid: Number(entry.amount_paid || 0),
			points_promised: Number(entry.points_promised || 0),
			points_paid: Number(entry.points_paid || 0),
		}));
	}

	const futureEvent = await FutureEvent.create({
		family_id: req.familyAccount._id,
		title,
		description: description || '',
		event_date,
		estimated_cost: estimatedCost,
		funding_source: normalizedFundingSource,
		required_points: normalizedRequiredPoints,
		members_contributing: normalizedContributors,
		total_contributed_money: normalizedContributors.reduce((sum, c) => sum + Number(c.amount_paid || 0), 0),
		total_contributed_points: normalizedContributors.reduce((sum, c) => sum + Number(c.points_paid || 0), 0),
		created_by: req.member.mail,
	});

	const autoCreatedRewardItems = [];
	if (normalizedRequiredPoints > 0) {
		let eventCategory = await WishlistCategory.findOne({
			title: 'Event Rewards',
			family_id: req.familyAccount._id,
		});

		if (!eventCategory) {
			eventCategory = await WishlistCategory.create({
				title: 'Event Rewards',
				description: 'Auto-generated rewards for family events',
				family_id: req.familyAccount._id,
			});
		}

		const familyMembers = await Member.find({ family_id: req.familyAccount._id }).populate('member_type_id', 'type');
		const children = familyMembers.filter((member) => member.member_type_id?.type !== 'Parent');

		for (const child of children) {
			let wishlist = await Wishlist.findOne({ member_mail: child.mail, family_id: req.familyAccount._id });
			if (!wishlist) {
				wishlist = await Wishlist.create({
					member_mail: child.mail,
					family_id: req.familyAccount._id,
					title: `${child.username}'s Wishlist`,
				});
			}

			const rewardItem = await WishlistItem.create({
				wishlist_id: wishlist._id,
				category_id: eventCategory._id,
				item_name: `Event Spot: ${futureEvent.title}`,
				required_points: normalizedRequiredPoints,
				assigned_by: req.member.mail,
				description: `Auto-generated event reward for ${futureEvent.title}`,
				priority: 1,
			});

			autoCreatedRewardItems.push({
				member_mail: child.mail,
				wishlist_item_id: rewardItem._id,
			});
			futureEvent.auto_created_reward_items.push(rewardItem._id);
		}

		await futureEvent.save();
	}

	res.status(201).json({
		status: 'success',
		message: 'Future event created successfully',
		data: {
			event: futureEvent,
			auto_created_reward_items: autoCreatedRewardItems,
		},
	});
});

exports.contributeToEvent = catchAsync(async (req, res, next) => {
	const { eventId } = req.params;
	const {
		contribution_type,
		amount,
		member_id,
		payment_mode = 'pay_now',
		manual_entry = false,
	} = req.body;
	const normalizedAmount = Number(amount);

	if (!['money', 'points'].includes(contribution_type)) {
		return next(new AppError("contribution_type must be 'money' or 'points'", 400));
	}

	if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
		return next(new AppError('amount must be a positive number', 400));
	}

	if (!mongoose.Types.ObjectId.isValid(eventId)) {
		return next(new AppError('Invalid event ID', 400));
	}

	const event = await FutureEvent.findOne({ _id: eventId, family_id: req.familyAccount._id });
	if (!event) {
		return next(new AppError('Event not found', 404));
	}

	const requesterType = await MemberType.findById(req.member.member_type_id).select('type');
	const isRequesterParent = requesterType?.type === 'Parent';

	let targetMember = req.member;
	if (member_id) {
		if (!mongoose.Types.ObjectId.isValid(member_id)) {
			return next(new AppError('Invalid member_id', 400));
		}

		targetMember = await Member.findOne({ _id: member_id, family_id: req.familyAccount._id });
		if (!targetMember) {
			return next(new AppError('Target member not found in this family', 404));
		}

		if (!isRequesterParent && targetMember._id.toString() !== req.member._id.toString()) {
			return next(new AppError('You can only contribute for yourself', 403));
		}
	}

	let contribution = event.members_contributing.find(
		(entry) => entry.member_id.toString() === targetMember._id.toString()
	);

	if (!contribution) {
		contribution = {
			member_id: targetMember._id,
			amount_promised: 0,
			amount_paid: 0,
			points_promised: 0,
			points_paid: 0,
		};
		event.members_contributing.push(contribution);
		contribution = event.members_contributing[event.members_contributing.length - 1];
	}

	let createdWalletTransaction = null;
	let createdPointHistory = null;
	const isPromiseOnly = payment_mode === 'promise';
	const isManualPaidEntry = manual_entry === true;

	if (contribution_type === 'money') {
		if (isPromiseOnly) {
			contribution.amount_promised = Number((Number(contribution.amount_promised || 0) + normalizedAmount).toFixed(2));
		} else {
			if (!isRequesterParent || !isManualPaidEntry || targetMember._id.toString() === req.member._id.toString()) {
				const memberWallet = await ensureMoneyWallet(targetMember.mail, req.familyAccount._id);
				if (memberWallet.balance < normalizedAmount) {
					return next(new AppError('Insufficient money balance', 400));
				}

				memberWallet.balance = Number((memberWallet.balance - normalizedAmount).toFixed(2));
				memberWallet.last_update = new Date();
				await memberWallet.save();

				createdWalletTransaction = await WalletTransaction.create({
					family_id: req.familyAccount._id,
					member_mail: targetMember.mail,
					member_wallet_id: memberWallet._id,
					amount: normalizedAmount,
					transaction_type: 'withdrawal',
					description: `Event contribution: ${event.title}`,
					conversion_type: 'none',
					converted_amount: normalizedAmount,
					conversion_rate: 1,
				});
			}

			contribution.amount_paid = Number((Number(contribution.amount_paid || 0) + normalizedAmount).toFixed(2));
			event.total_contributed_money = Number((Number(event.total_contributed_money || 0) + normalizedAmount).toFixed(2));
		}
	} else {
		if (isPromiseOnly) {
			contribution.points_promised = Number((Number(contribution.points_promised || 0) + normalizedAmount).toFixed(2));
		} else {
			if (!isRequesterParent || !isManualPaidEntry || targetMember._id.toString() === req.member._id.toString()) {
				const pointWallet = await ensurePointWallet(targetMember.mail, req.familyAccount._id);
				if (pointWallet.total_points < normalizedAmount) {
					return next(new AppError('Insufficient points balance', 400));
				}

				pointWallet.total_points = Number((pointWallet.total_points - normalizedAmount).toFixed(2));
				pointWallet.last_update = new Date();
				await pointWallet.save();

				createdPointHistory = await PointHistory.create({
					wallet_id: pointWallet._id,
					member_mail: targetMember.mail,
					family_id: req.familyAccount._id,
					points_amount: -normalizedAmount,
					reason_type: 'adjustment',
					granted_by: req.member.mail,
					description: `Event contribution: ${event.title}`,
				});
			}

			contribution.points_paid = Number((Number(contribution.points_paid || 0) + normalizedAmount).toFixed(2));
			event.total_contributed_points = Number((Number(event.total_contributed_points || 0) + normalizedAmount).toFixed(2));
		}
	}

	await event.save();

	const notification = await sendParentNotification(
		req.familyAccount._id,
		'Event contribution received',
		`${targetMember.username || targetMember.mail} ${isPromiseOnly ? 'promised' : 'contributed'} ${normalizedAmount} ${contribution_type} to ${event.title}.`
	).catch((error) => ({ sent: false, recipients: [], error: error.message }));

	res.status(200).json({
		status: 'success',
		message: 'Contribution recorded successfully',
		data: {
			event,
			contribution,
			target_member: {
				member_id: targetMember._id,
				member_mail: targetMember.mail,
				member_name: targetMember.username,
			},
			wallet_transaction: createdWalletTransaction,
			point_history: createdPointHistory,
			notification,
		},
	});
});

exports.markContributionPaid = catchAsync(async (req, res, next) => {
	const { eventId } = req.params;
	const { member_id, contribution_type, amount } = req.body;
	const normalizedAmount = Number(amount);

	if (!mongoose.Types.ObjectId.isValid(eventId)) {
		return next(new AppError('Invalid event ID', 400));
	}

	if (!mongoose.Types.ObjectId.isValid(member_id)) {
		return next(new AppError('Invalid member_id', 400));
	}

	if (!['money', 'points'].includes(contribution_type)) {
		return next(new AppError("contribution_type must be 'money' or 'points'", 400));
	}

	if (!Number.isFinite(normalizedAmount) || normalizedAmount <= 0) {
		return next(new AppError('amount must be a positive number', 400));
	}

	const event = await FutureEvent.findOne({ _id: eventId, family_id: req.familyAccount._id });
	if (!event) {
		return next(new AppError('Event not found', 404));
	}

	const memberType = await MemberType.findById(req.member.member_type_id).select('type');
	if (memberType?.type !== 'Parent') {
		return next(new AppError('Only parents can mark contributions as paid', 403));
	}

	let contribution = event.members_contributing.find(
		(entry) => entry.member_id.toString() === member_id.toString()
	);

	if (!contribution) {
		contribution = {
			member_id,
			amount_promised: 0,
			amount_paid: 0,
			points_promised: 0,
			points_paid: 0,
		};
		event.members_contributing.push(contribution);
		contribution = event.members_contributing[event.members_contributing.length - 1];
	}

	if (contribution_type === 'money') {
		const availablePromised = Number(contribution.amount_promised || 0);
		if (availablePromised < normalizedAmount) {
			return next(new AppError('Cannot mark paid more than promised money amount', 400));
		}

		contribution.amount_promised = Number((availablePromised - normalizedAmount).toFixed(2));
		contribution.amount_paid = Number((Number(contribution.amount_paid || 0) + normalizedAmount).toFixed(2));
		event.total_contributed_money = Number((Number(event.total_contributed_money || 0) + normalizedAmount).toFixed(2));
	} else {
		const availablePromised = Number(contribution.points_promised || 0);
		if (availablePromised < normalizedAmount) {
			return next(new AppError('Cannot mark paid more than promised points amount', 400));
		}

		contribution.points_promised = Number((availablePromised - normalizedAmount).toFixed(2));
		contribution.points_paid = Number((Number(contribution.points_paid || 0) + normalizedAmount).toFixed(2));
		event.total_contributed_points = Number((Number(event.total_contributed_points || 0) + normalizedAmount).toFixed(2));
	}

	await event.save();

	res.status(200).json({
		status: 'success',
		message: 'Contribution marked as paid',
		data: { event, contribution },
	});
});

exports.adjustFundingGoal = catchAsync(async (req, res, next) => {
	const { eventId } = req.params;
	const { estimated_cost } = req.body;
	const normalizedCost = Number(estimated_cost);

	if (!mongoose.Types.ObjectId.isValid(eventId)) {
		return next(new AppError('Invalid event ID', 400));
	}

	if (!Number.isFinite(normalizedCost) || normalizedCost < 0) {
		return next(new AppError('estimated_cost must be a non-negative number', 400));
	}

	const memberType = await MemberType.findById(req.member.member_type_id).select('type');
	if (memberType?.type !== 'Parent') {
		return next(new AppError('Only parents can adjust funding goal', 403));
	}

	const event = await FutureEvent.findOneAndUpdate(
		{ _id: eventId, family_id: req.familyAccount._id },
		{ $set: { estimated_cost: normalizedCost } },
		{ new: true }
	);

	if (!event) {
		return next(new AppError('Event not found', 404));
	}

	res.status(200).json({
		status: 'success',
		message: 'Funding goal adjusted successfully',
		data: { event },
	});
});

exports.getEventFundingStatus = catchAsync(async (req, res, next) => {
	const { eventId } = req.params;

	if (!mongoose.Types.ObjectId.isValid(eventId)) {
		return next(new AppError('Invalid event ID', 400));
	}

	const event = await FutureEvent.findOne({ _id: eventId, family_id: req.familyAccount._id })
		.populate('members_contributing.member_id', 'username mail');

	if (!event) {
		return next(new AppError('Event not found', 404));
	}

	const totalEstimatedCost = Number(event.estimated_cost || 0);
	const totalContributedMoney = Number(event.total_contributed_money || 0);
	const totalContributedPoints = Number(event.total_contributed_points || 0);
	const remainingNeeded = Number(Math.max(0, totalEstimatedCost - totalContributedMoney).toFixed(2));
	const progressPercentage = totalEstimatedCost > 0
		? Number(Math.min(100, (totalContributedMoney / totalEstimatedCost) * 100).toFixed(2))
		: 0;
	const eventDate = new Date(event.event_date);
	const now = new Date();
	const daysRemaining = Number(Math.max(0, Math.ceil((eventDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))));
	const monthsRemaining = Math.max(1, Math.ceil(daysRemaining / 30));
	const monthlySavingsNeeded = Number((remainingNeeded / monthsRemaining).toFixed(2));

	const breakdownByMember = event.members_contributing.map((entry) => ({
		member_id: entry.member_id?._id || entry.member_id,
		member_name: entry.member_id?.username || 'Unknown',
		member_mail: entry.member_id?.mail || null,
		amount_promised: Number(entry.amount_promised || 0),
		amount_paid: Number(entry.amount_paid || 0),
		points_promised: Number(entry.points_promised || 0),
		points_paid: Number(entry.points_paid || 0),
	}));

	const redeemedSpots = await Redeem.find({
		family_id: req.familyAccount._id,
		linked_event_id: event._id,
		status: 'child_accepted',
	}).select('requester points_used createdAt');

	const membersRedeemedSpots = redeemedSpots.map((entry) => ({
		member_mail: entry.requester,
		points_used: Number(entry.points_used || 0),
		redeemed_at: entry.createdAt,
	}));

	const rewardsBudget = await getRewardsBudget(req.familyAccount._id);
	const rewardsBudgetRemaining = rewardsBudget
		? Number((Number(rewardsBudget.budget_amount || 0) - Number(rewardsBudget.spent_amount || 0)).toFixed(2))
		: null;

	res.status(200).json({
		status: 'success',
		data: {
			event_id: event._id,
			event_title: event.title,
			event_date: event.event_date,
			funding_source: event.funding_source,
			required_points: Number(event.required_points || 0),
			total_estimated_cost: totalEstimatedCost,
			total_contributed_money: totalContributedMoney,
			total_contributed_points: totalContributedPoints,
			remaining_needed: remainingNeeded,
			progress_percentage: progressPercentage,
			days_remaining: daysRemaining,
			monthly_savings_needed: monthlySavingsNeeded,
			rewards_budget_remaining: rewardsBudgetRemaining,
			members_redeemed_spots: membersRedeemedSpots,
			breakdown_by_member: breakdownByMember,
		},
	});
});

exports.getCombinedAnalytics = catchAsync(async (req, res, next) => {
	const familyId = req.familyAccount._id;
	const now = new Date();
	const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

	const [
		members,
		expenses,
		pointHistory,
		walletTransactions,
		allowances,
		budgets,
		memberWallets,
	] = await Promise.all([
		Member.find({ family_id: familyId }).populate('member_type_id', 'type').select('_id username mail member_type_id'),
		Expense.find({ family_id: familyId }).select('category amount expense_source expense_date createdAt member_mail'),
		PointHistory.find({ family_id: familyId }).select('member_mail points_amount reason_type createdAt'),
		WalletTransaction.find({ family_id: familyId }).select('member_mail amount transaction_type description transaction_date createdAt'),
		MemberAllowance.find({ family_id: familyId }).select('member_mail allowance_currency money_amount createdAt'),
		Budget.find({ family_id: familyId, is_active: true }).select('category_name budget_amount spent_amount'),
		MemberWallet.find({ family_id: familyId }).select('member_mail balance'),
	]);

	const children = members.filter((member) => member.member_type_id?.type !== 'Parent');
	const memberByMail = new Map(members.map((member) => [member.mail, member]));

	const totalFamilySpending = expenses.reduce((sum, item) => sum + Number(item.amount || 0), 0);

	let totalPointsEarned = 0;
	let totalPointsRedeemed = 0;
	for (const item of pointHistory) {
		const value = Number(item.points_amount || 0);
		if (value > 0) totalPointsEarned += value;
		if (value < 0 && item.reason_type === 'redeem') totalPointsRedeemed += Math.abs(value);
	}

	const allowanceMoneyFromModel = allowances.reduce(
		(sum, entry) => sum + Number(entry.money_amount || 0),
		0
	);

	const rewardDeposits = walletTransactions.filter((tx) =>
		tx.transaction_type === 'deposit' && /^Task completed:/i.test(tx.description || '')
	);
	const allowanceDeposits = walletTransactions.filter((tx) =>
		tx.transaction_type === 'deposit' && /allowance/i.test(tx.description || '')
	);

	const moneyGivenTaskRewards = rewardDeposits.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
	const moneyGivenAllowances = allowanceMoneyFromModel + allowanceDeposits.reduce((sum, tx) => sum + Number(tx.amount || 0), 0);
	const totalMoneyGivenAsAllowanceRewards = Number((moneyGivenTaskRewards + moneyGivenAllowances).toFixed(2));

	const spendingByCategoryMap = new Map();
	for (const expense of expenses) {
		const category = (expense.category || 'Uncategorized').trim() || 'Uncategorized';
		spendingByCategoryMap.set(
			category,
			Number((Number(spendingByCategoryMap.get(category) || 0) + Number(expense.amount || 0)).toFixed(2))
		);
	}
	if (moneyGivenAllowances > 0) {
		spendingByCategoryMap.set(
			'Allowances',
			Number((Number(spendingByCategoryMap.get('Allowances') || 0) + moneyGivenAllowances).toFixed(2))
		);
	}
	if (moneyGivenTaskRewards > 0) {
		spendingByCategoryMap.set(
			'Rewards',
			Number((Number(spendingByCategoryMap.get('Rewards') || 0) + moneyGivenTaskRewards).toFixed(2))
		);
	}

	const spendingByCategory = Array.from(spendingByCategoryMap.entries()).map(([category, amount]) => ({
		category,
		amount,
	}));

	const pointsEarnedRedeemedByMember = children.map((child) => {
		const history = pointHistory.filter((entry) => entry.member_mail === child.mail);
		const earned = history
			.filter((entry) => Number(entry.points_amount || 0) > 0)
			.reduce((sum, entry) => sum + Number(entry.points_amount || 0), 0);
		const redeemed = history
			.filter((entry) => Number(entry.points_amount || 0) < 0 && entry.reason_type === 'redeem')
			.reduce((sum, entry) => sum + Math.abs(Number(entry.points_amount || 0)), 0);

		return {
			member_id: child._id,
			member_name: child.username,
			member_mail: child.mail,
			points_earned: Number(earned.toFixed(2)),
			points_redeemed: Number(redeemed.toFixed(2)),
		};
	});

	const rewardsSpendingOverTimeMap = new Map();
	for (const expense of expenses) {
		const isRewardExpense =
			(expense.category || '').toLowerCase() === 'rewards' || expense.expense_source === 'redeem_reward';
		if (!isRewardExpense) continue;

		const date = new Date(expense.expense_date || expense.createdAt || now);
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		rewardsSpendingOverTimeMap.set(
			key,
			Number((Number(rewardsSpendingOverTimeMap.get(key) || 0) + Number(expense.amount || 0)).toFixed(2))
		);
	}
	for (const tx of rewardDeposits) {
		const date = new Date(tx.transaction_date || tx.createdAt || now);
		const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
		rewardsSpendingOverTimeMap.set(
			key,
			Number((Number(rewardsSpendingOverTimeMap.get(key) || 0) + Number(tx.amount || 0)).toFixed(2))
		);
	}

	const rewardsSpendingOverTime = Array.from(rewardsSpendingOverTimeMap.entries())
		.sort((a, b) => a[0].localeCompare(b[0]))
		.map(([date, amount]) => ({ date, amount }));

	const walletMap = new Map(memberWallets.map((wallet) => [wallet.member_mail, wallet]));

	const memberSummaries = children.map((child) => {
		const pointsEntries = pointHistory.filter((entry) => entry.member_mail === child.mail);
		const pointsEarned = pointsEntries
			.filter((entry) => Number(entry.points_amount || 0) > 0)
			.reduce((sum, entry) => sum + Number(entry.points_amount || 0), 0);
		const pointsRedeemed = pointsEntries
			.filter((entry) => Number(entry.points_amount || 0) < 0 && entry.reason_type === 'redeem')
			.reduce((sum, entry) => sum + Math.abs(Number(entry.points_amount || 0)), 0);

		const allowanceMoney = allowances
			.filter((entry) => entry.member_mail === child.mail)
			.reduce((sum, entry) => sum + Number(entry.money_amount || 0), 0);

		const taskRewardMoney = rewardDeposits
			.filter((entry) => entry.member_mail === child.mail)
			.reduce((sum, entry) => sum + Number(entry.amount || 0), 0);

		const wallet = walletMap.get(child.mail);

		return {
			member_id: child._id,
			member_name: child.username,
			member_mail: child.mail,
			money_received: Number((allowanceMoney + taskRewardMoney).toFixed(2)),
			allowance_money_received: Number(allowanceMoney.toFixed(2)),
			task_rewards_money_received: Number(taskRewardMoney.toFixed(2)),
			points_earned: Number(pointsEarned.toFixed(2)),
			points_redeemed: Number(pointsRedeemed.toFixed(2)),
			current_money_saved: Number((wallet?.balance || 0).toFixed(2)),
		};
	});

	const rewardsBudget = budgets.find((budget) => (budget.category_name || '').toLowerCase() === 'rewards');
	const allowancesBudget = budgets.find((budget) => (budget.category_name || '').toLowerCase() === 'allowances');

	const budgetHealth = {
		rewards: {
			budget_amount: Number(rewardsBudget?.budget_amount || 0),
			spent_amount: Number(rewardsBudget?.spent_amount || 0),
			over_budget: Number(rewardsBudget?.spent_amount || 0) > Number(rewardsBudget?.budget_amount || 0),
		},
		allowances: {
			budget_amount: Number(allowancesBudget?.budget_amount || 0),
			spent_amount: Number(allowancesBudget?.spent_amount || 0),
			over_budget: Number(allowancesBudget?.spent_amount || 0) > Number(allowancesBudget?.budget_amount || 0),
		},
	};

	const alerts = [];
	if (budgetHealth.rewards.over_budget) {
		alerts.push('Rewards category is over budget');
	}
	if (budgetHealth.allowances.over_budget) {
		alerts.push('Allowances category is over budget');
	}

	const monthlySummary = {
		month: `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`,
		money_spent_this_month: Number(
			expenses
				.filter((entry) => new Date(entry.expense_date || entry.createdAt || now) >= monthStart)
				.reduce((sum, entry) => sum + Number(entry.amount || 0), 0)
				.toFixed(2)
		),
		points_earned_this_month: Number(
			pointHistory
				.filter((entry) => new Date(entry.createdAt || now) >= monthStart && Number(entry.points_amount || 0) > 0)
				.reduce((sum, entry) => sum + Number(entry.points_amount || 0), 0)
				.toFixed(2)
		),
		points_redeemed_this_month: Number(
			pointHistory
				.filter(
					(entry) =>
						new Date(entry.createdAt || now) >= monthStart &&
						Number(entry.points_amount || 0) < 0 &&
						entry.reason_type === 'redeem'
				)
				.reduce((sum, entry) => sum + Math.abs(Number(entry.points_amount || 0)), 0)
				.toFixed(2)
		),
	};

	res.status(200).json({
		status: 'success',
		data: {
			overview: {
				total_family_spending: Number(totalFamilySpending.toFixed(2)),
				total_points_earned: Number(totalPointsEarned.toFixed(2)),
				total_points_redeemed: Number(totalPointsRedeemed.toFixed(2)),
				total_money_given_as_allowance_rewards: totalMoneyGivenAsAllowanceRewards,
			},
			charts: {
				spending_by_category: spendingByCategory,
				points_earned_vs_redeemed_by_member: pointsEarnedRedeemedByMember,
				rewards_spending_over_time: rewardsSpendingOverTime,
			},
			member_summaries: memberSummaries,
			budget_health: budgetHealth,
			alerts,
			monthly_summary_for_parents: monthlySummary,
		},
	});
});
