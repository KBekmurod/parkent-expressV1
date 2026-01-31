const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: {
    type: String,
    unique: true,
    index: true
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    index: true
  },
  from: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'fromModel'
  },
  fromModel: {
    type: String,
    enum: ['User', 'Vendor', 'Driver', 'Platform'],
    required: true
  },
  to: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'toModel'
  },
  toModel: {
    type: String,
    enum: ['User', 'Vendor', 'Driver', 'Platform'],
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  type: {
    type: String,
    enum: ['payment', 'refund', 'payout', 'commission'],
    required: true,
    index: true
  },
  paymentMethod: {
    type: String,
    enum: ['cash', 'card', 'payme', 'click', 'bank_transfer'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
    index: true
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
transactionSchema.index({ from: 1, fromModel: 1, createdAt: -1 });
transactionSchema.index({ to: 1, toModel: 1, createdAt: -1 });
transactionSchema.index({ type: 1, status: 1 });
transactionSchema.index({ createdAt: -1 });

// Auto-generate transactionId before saving
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const date = new Date();
    const prefix = `TXN${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
    
    // Find the last transaction for today
    const lastTransaction = await this.constructor.findOne({ 
      transactionId: { $regex: `^${prefix}` } 
    }).sort({ transactionId: -1 }).select('transactionId');
    
    let sequence = 1;
    if (lastTransaction) {
      const lastSequence = parseInt(lastTransaction.transactionId.slice(-6));
      sequence = lastSequence + 1;
    }
    
    this.transactionId = `${prefix}${String(sequence).padStart(6, '0')}`;
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
