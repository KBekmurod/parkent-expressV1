const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  vendor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vendor',
    required: true,
    index: true
  },
  name: {
    uz: {
      type: String,
      required: true,
      trim: true
    },
    ru: {
      type: String,
      trim: true
    }
  },
  description: {
    uz: {
      type: String,
      trim: true
    },
    ru: {
      type: String,
      trim: true
    }
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  photo: {
    type: String,
    default: ''
  },
  category: {
    type: String,
    required: true,
    trim: true
  },
  preparationTime: {
    type: Number,
    required: true,
    default: 30 // minutes
  },
  isAvailable: {
    type: Boolean,
    default: true
  },
  discount: {
    type: Number,
    default: 0,
    min: 0,
    max: 100 // percentage
  }
}, {
  timestamps: true
});

// Indexes
productSchema.index({ vendor: 1, isAvailable: 1 });
productSchema.index({ category: 1 });

// Virtual for discounted price
productSchema.virtual('finalPrice').get(function() {
  if (this.discount > 0) {
    return Math.round(this.price * (1 - this.discount / 100));
  }
  return this.price;
});

module.exports = mongoose.model('Product', productSchema);
