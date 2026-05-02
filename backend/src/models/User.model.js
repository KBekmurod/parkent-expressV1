const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  address: {
    type: String,
    required: true,
    trim: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, { _id: false });

const userSchema = new mongoose.Schema({
  telegramId: {
    type: String,
    unique: true,
    sparse: true,  // null qiymatga ruxsat beradi (web foydalanuvchilar uchun)
    index: true,
    trim: true
  },
  // Web foydalanuvchilar uchun alohida telefon maydoni (telegramId hiyla-nayrang o'rniga)
  webPhone: {
    type: String,
    unique: true,
    sparse: true,
    trim: true
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
    trim: true,
    sparse: true,
    default: ''
  },
  webPin: {
    type: String,
    select: false  // Xavfsizlik: odatda so'rovlarga kiritilmaydi
  },
  addresses: [addressSchema],
  totalOrders: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['active', 'blocked'],
    default: 'active'
  },
  // Foydalanuvchi turi: 'telegram' yoki 'web'
  authType: {
    type: String,
    enum: ['telegram', 'web'],
    default: 'telegram'
  },
  phoneHistory: [{
    phone: String,
    changedAt: { type: Date, default: Date.now }
  }]
}, {
  timestamps: true
});

// Indekslar
userSchema.index({ phone: 1 });
userSchema.index({ status: 1 });
userSchema.index({ webPhone: 1 });
userSchema.index({ authType: 1 });

module.exports = mongoose.model('User', userSchema);
