const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  vehicle: {
    type: String,
    enum: ['bicycle', 'motorcycle', 'car'],
    required: true
  },
  documentPhoto: {
    type: String,
    default: ''
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalDeliveries: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'blocked'],
    default: 'pending'
  },
  isOnline: {
    type: Boolean,
    default: false
  },
  currentLocation: {
    lat: {
      type: Number,
      default: 0
    },
    lng: {
      type: Number,
      default: 0
    }
  },
  currentOrders: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }],
  balance: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes
driverSchema.index({ status: 1 });
driverSchema.index({ isOnline: 1 });
driverSchema.index({ currentLocation: '2dsphere' }); // Geospatial index

// Validation: Max 3 current orders
driverSchema.path('currentOrders').validate(function(value) {
  return value.length <= 3;
}, 'Driver cannot have more than 3 current orders');

module.exports = mongoose.model('Driver', driverSchema);
