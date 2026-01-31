const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    unique: true,
    index: true
  },
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  driver: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    index: true
  },
  vendorRating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  driverRating: {
    type: Number,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    trim: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes
reviewSchema.index({ vendor: 1, createdAt: -1 });
reviewSchema.index({ driver: 1, createdAt: -1 });

// Update vendor rating after review
reviewSchema.post('save', async function() {
  const Review = this.constructor;
  const Vendor = mongoose.model('Vendor');
  
  const stats = await Review.aggregate([
    { $match: { vendor: this.vendor } },
    { $group: { _id: null, avgRating: { $avg: '$vendorRating' } } }
  ]);
  
  if (stats.length > 0) {
    await Vendor.findByIdAndUpdate(this.vendor, {
      rating: Math.round(stats[0].avgRating * 10) / 10
    });
  }
  
  // Update driver rating if exists
  if (this.driver && this.driverRating) {
    const Driver = mongoose.model('Driver');
    const driverStats = await Review.aggregate([
      { $match: { driver: this.driver, driverRating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$driverRating' } } }
    ]);
    
    if (driverStats.length > 0) {
      await Driver.findByIdAndUpdate(this.driver, {
        rating: Math.round(driverStats[0].avgRating * 10) / 10
      });
    }
  }
});

module.exports = mongoose.model('Review', reviewSchema);
