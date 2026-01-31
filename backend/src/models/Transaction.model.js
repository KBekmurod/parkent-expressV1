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

// Auto-generate transactionId before saving with retry logic
transactionSchema.pre('save', async function(next) {
  if (!this.transactionId) {
    const maxRetries = 3;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
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
        break; // Success, exit retry loop
      } catch (error) {
        if (attempt === maxRetries) {
          throw new Error('Failed to generate unique transaction ID after multiple attempts');
        }
        // Wait a bit before retrying
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
  }
  next();
});

module.exports = mongoose.model('Transaction', transactionSchema);
