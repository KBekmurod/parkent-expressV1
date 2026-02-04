const mongoose = require('mongoose');

const driverDepositSchema = new mongoose.Schema({
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true,
    unique: true
  },
  amount: {
    type: Number,
    required: true,
    default: 500000  // 500,000 sum default deposit
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'refunded', 'forfeited'],
    default: 'pending'
  },
  paidDate: Date,
  refundDate: Date,
  refundedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Admin'
  },
  notes: String
}, {
  timestamps: true
});

module.exports = mongoose.model('DriverDeposit', driverDepositSchema);
