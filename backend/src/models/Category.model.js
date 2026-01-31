const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    uz: {
      type: String,
      required: true,
      trim: true,
      unique: true
    },
    ru: {
      type: String,
      trim: true
    }
  },
  icon: {
    type: String,
    default: '🍽️'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Index
categorySchema.index({ order: 1 });

module.exports = mongoose.model('Category', categorySchema);
