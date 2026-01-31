const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  type: {
    type: String,
    enum: ['order', 'commission', 'withdrawal', 'refund'],
    required: true,
    index: true
  },
  amount: {
    type: Number,
    required: true
  },
  from: {
    model: {
      type: String,
      enum: ['User', 'Vendor', 'Driver', 'Platform'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'from.model'
    }
  },
  to: {
    model: {
      type: String,
      enum: ['User', 'Vendor', 'Driver', 'Platform'],
      required: true
    },
    id: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: 'to.model'
    }
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'pending',
    index: true
  },
  description: {
    type: String,
    trim: true
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ 'from.id': 1, createdAt: -1 });
transactionSchema.index({ 'to.id': 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
