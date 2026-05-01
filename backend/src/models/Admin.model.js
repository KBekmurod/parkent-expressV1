const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const adminSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
    match: /^\S+@\S+\.\S+$/
  },
  password: {
    type: String,
    required: true,
    minlength: 6
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
  role: {
    type: String,
    enum: ['super_admin', 'operator', 'accountant'],
    default: 'operator'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date
  },
  // Admin o'z Telegram ID'sini settings'da qo'shadi
  // Shunda yangi vendor/driver/buyurtma haqida Telegram'da xabar oladi
  telegramId: {
    type: String,
    trim: true,
    sparse: true,
    default: null
  },
  // Qaysi bildirishnomalarni olish
  notifications: {
    newVendor: { type: Boolean, default: true },
    newDriver: { type: Boolean, default: true },
    newOrder: { type: Boolean, default: false }, // Ko'p buyurtma bo'lganda spam qilmasin
    systemAlerts: { type: Boolean, default: true }
  }
}, {
  timestamps: true
});

// Hash password before save
adminSchema.pre('save', async function(next) {
  if (!this.isModified('password')) {
    return next();
  }
  
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password method
adminSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Don't return password in JSON
adminSchema.methods.toJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

module.exports = mongoose.model('Admin', adminSchema);
