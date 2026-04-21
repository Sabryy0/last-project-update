const mongoose = require('mongoose');

const balanceWalletDetailSchema = new mongoose.Schema({
	family_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'FamilyAccount',
		required: [true, 'Please provide a family account ID'],
	},
	member_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member',
		default: null,
	},
	member_mail: {
		type: String,
		required: [true, 'Please provide the member email'],
	},
	wallet_scope: {
		type: String,
		enum: ['money_wallet', 'points_wallet', 'shared_budget', 'personal_budget'],
		default: 'money_wallet',
	},
	change_type: {
		type: String,
		enum: ['credit', 'debit'],
		required: [true, 'Please provide change_type'],
	},
	source_type: {
		type: String,
		enum: ['allowance', 'task_reward', 'conversion', 'redeem', 'expense', 'manual_adjustment', 'event_contribution', 'budget_withdrawal'],
		required: [true, 'Please provide source_type'],
	},
	amount: {
		type: Number,
		required: [true, 'Please provide amount'],
		min: [0, 'Amount cannot be negative'],
	},
	previous_balance: {
		type: Number,
		default: 0,
	},
	new_balance: {
		type: Number,
		default: 0,
	},
	title: {
		type: String,
		default: '',
	},
	description: {
		type: String,
		default: '',
	},
	added_by_member_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member',
		default: null,
	},
	added_by_mail: {
		type: String,
		default: null,
	},
	member_wallet_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'MemberWallet',
		default: null,
	},
	point_wallet_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PointWallet',
		default: null,
	},
	linked_expense_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Expense',
		default: null,
	},
	linked_wallet_transaction_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'WalletTransaction',
		default: null,
	},
	linked_point_history_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'PointHistory',
		default: null,
	},
	linked_redeem_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Redeem',
		default: null,
	},
	linked_task_history_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'TaskDetails',
		default: null,
	},
	budget_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Budget',
		default: null,
	},
	budget_category_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'InventoryCategory',
		default: null,
	},
	notes: {
		type: String,
		default: '',
	},
}, {
	timestamps: true,
});

balanceWalletDetailSchema.index({ family_id: 1, member_mail: 1, createdAt: -1 });
balanceWalletDetailSchema.index({ family_id: 1, wallet_scope: 1, createdAt: -1 });
balanceWalletDetailSchema.index({ family_id: 1, source_type: 1, createdAt: -1 });

const BalanceWalletDetail = mongoose.models.BalanceWalletDetail || mongoose.model('BalanceWalletDetail', balanceWalletDetailSchema);

module.exports = BalanceWalletDetail;