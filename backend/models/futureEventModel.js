const mongoose = require('mongoose');

const memberContributionSchema = new mongoose.Schema({
	member_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Member',
		required: [true, 'Please provide the member ID']
	},
	amount_promised: {
		type: Number,
		default: 0,
		min: [0, 'Promised amount cannot be negative']
	},
	amount_paid: {
		type: Number,
		default: 0,
		min: [0, 'Paid amount cannot be negative']
	},
	points_promised: {
		type: Number,
		default: 0,
		min: [0, 'Promised points cannot be negative']
	},
	points_paid: {
		type: Number,
		default: 0,
		min: [0, 'Paid points cannot be negative']
	}
}, { _id: false });

const futureEventSchema = new mongoose.Schema({
	family_id: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'FamilyAccount',
		required: [true, 'Please provide a family account ID']
	},
	title: {
		type: String,
		required: [true, 'Please provide the event title'],
		trim: true
	},
	description: {
		type: String,
		default: ''
	},
	event_date: {
		type: Date,
		required: [true, 'Please provide the event date']
	},
	estimated_cost: {
		type: Number,
		default: 0,
		min: [0, 'Estimated cost cannot be negative']
	},
	total_contributed_money: {
		type: Number,
		default: 0,
		min: [0, 'Total contributed money cannot be negative']
	},
	total_contributed_points: {
		type: Number,
		default: 0,
		min: [0, 'Total contributed points cannot be negative']
	},
	funding_source: {
		type: String,
		enum: ['budget', 'member_contributions', 'points_redeem'],
		default: 'budget'
	},
	required_points: {
		type: Number,
		default: 0,
		min: [0, 'Required points cannot be negative']
	},
	linked_rewards: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'Redeem'
	}],
	members_contributing: [memberContributionSchema],
	auto_created_reward_items: [{
		type: mongoose.Schema.Types.ObjectId,
		ref: 'WishlistItem'
	}],
	created_by: {
		type: String,
		ref: 'Member',
		default: null
	}
}, {
	timestamps: true
});

futureEventSchema.index({ family_id: 1, event_date: 1 });
futureEventSchema.index({ family_id: 1, funding_source: 1 });

const FutureEvent = mongoose.model('FutureEvent', futureEventSchema);

module.exports = FutureEvent;
