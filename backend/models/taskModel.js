const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Please provide the task title']
  },
  description: {
    type: String,
    default: ''
  },
  is_mandatory: {
    type: Boolean,
    default: false
  },
  created_by: {
    type: String,
    required: [true, 'Please provide who created the task'],
    ref: 'Member'
  },
  reward_type: {
    type: String,
    enum: ['points', 'money', 'both'],
    default: 'points'
  },
  money_reward: {
    type: Number,
    default: 0,
    min: [0, 'Money reward cannot be negative']
  },
  paid_to_wallet: {
    type: Boolean,
    default: false
  },
  category_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TaskCategory',
    required: [true, 'Please provide a task category']
  },
  family_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'FamilyAccount',
    required: [true, 'Please provide a family account ID']
  }
}, {
  timestamps: true
});

// Indexes for faster queries
taskSchema.index({ family_id: 1, category_id: 1 });
taskSchema.index({ created_by: 1 });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;
