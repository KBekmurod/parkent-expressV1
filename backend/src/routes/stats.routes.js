const express = require('express');
const router = express.Router();
const {
  getDashboardStats,
  getOrderAnalytics,
  getVendorStats,
  getDriverStats,
  getRevenueAnalytics
} = require('../controllers/stats.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validateObjectId } = require('../middleware/validation.middleware');

// Public routes (Telegram bot)
router.get('/vendor/:vendorId', validateObjectId('vendorId'), getVendorStats);
router.get('/driver/:driverId', validateObjectId('driverId'), getDriverStats);

// Admin routes
router.get('/dashboard', protect, adminAuth, getDashboardStats);
router.get('/orders', protect, adminAuth, getOrderAnalytics);
router.get('/revenue', protect, adminAuth, getRevenueAnalytics);

module.exports = router;
