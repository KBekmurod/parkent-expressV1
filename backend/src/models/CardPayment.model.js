const mongoose = require('mongoose');

const cardPaymentSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  receiptPhoto: {
    type: String,
    default: ''
  },
  receiptMetadata: {
    uploadedAt: Date,
    fileSize: Number,
    mimeType: String,
    imageHash: String  // For duplicate detection
  },
  customerConfirmed: {
    type: Boolean,
    default: false
  },
  customerConfirmedAt: Date,
  adminVerified: {
    type: Boolean,
    default: false
  },
  adminVerifiedAt: Date,
  adminVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  verificationNotes: String,
  settlementStatus: {
    type: String,
    enum: ['pending', 'settled', 'disputed'],
    default: 'pending'
  },
  settlementDate: Date,
  settledBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  }
}, {
  timestamps: true
});

// Indexes for performance
cardPaymentSchema.index({ driverId: 1, createdAt: -1 });
cardPaymentSchema.index({ settlementStatus: 1, createdAt: -1 });

// Methods
cardPaymentSchema.methods.markAsVerified = function(adminId, notes) {
  this.adminVerified = true;
  this.adminVerifiedAt = new Date();
  this.adminVerifiedBy = adminId;
  if (notes) this.verificationNotes = notes;
  return this.save();
};

cardPaymentSchema.methods.markAsSettled = function(adminId) {
  this.settlementStatus = 'settled';
  this.settlementDate = new Date();
  this.settledBy = adminId;
  return this.save();
};

module.exports = mongoose.model('CardPayment', cardPaymentSchema);
