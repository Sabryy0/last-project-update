const mongoose = require('mongoose');

const budgetSchema = new mongoose.Schema({
	family_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'FamilyAccount',
		required: [true, 'Please provide a family account ID']
	},
	category_name: {
		type: String,
		required: [true, 'Please provide the budget category name'],
		trim: true
	},
	budget_amount: {
		type: Number,
		default: 0,
		min: [0, 'Budget amount cannot be negative']
	},
	spent_amount: {
		type: Number,
		default: 0,
		min: [0, 'Spent amount cannot be negative']
	},
	is_active: {
		type: Boolean,
		default: true
	}
}, {
	timestamps: true
});

budgetSchema.index({ family_id: 1, category_name: 1 }, { unique: true });

const Budget = mongoose.models.Budget || mongoose.model('Budget', budgetSchema);

module.exports = Budget;
