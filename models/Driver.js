const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  vehicleType: {
    type: String,
    enum: ['bike', 'scooter', 'car', 'bicycle'],
    required: [true, 'Please specify vehicle type']
  },
  vehicleNumber: {
    type: String,
    required: [true, 'Please add vehicle number']
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please add license number']
  },
  status: {
    type: String,
    enum: ['available', 'busy', 'offline'],
    default: 'offline'
  },
  currentLocation: {
    coordinates: {
      lat: Number,
      lng: Number
    },
    address: String
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
  totalReviews: {
    type: Number,
    default: 0
  },
  isApproved: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  documents: {
    license: String,
    vehicleRegistration: String,
    insurance: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Driver', driverSchema);
