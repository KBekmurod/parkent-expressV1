const mongoose = require('mongoose');

const workingHoursSchema = new mongoose.Schema({
  start: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/ // HH:MM format
  },
  end: {
    type: String,
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
  }
}, { _id: false });

const vendorSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  logo: {
    type: String,
    default: ''
  },
  workingHours: {
    type: workingHoursSchema,
    required: true
  },
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalOrders: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'active', 'blocked', 'closed'],
    default: 'pending'
  },
  commission: {
    type: Number,
    default: 10 // 10%
  },
  balance: {
    type: Number,
    default: 0
  },
  isOpen: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes
vendorSchema.index({ category: 1 });
vendorSchema.index({ status: 1 });
vendorSchema.index({ rating: -1 });
vendorSchema.index({ location: '2dsphere' }); // Geospatial index

module.exports = mongoose.model('Vendor', vendorSchema);
