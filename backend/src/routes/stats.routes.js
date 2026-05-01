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

// Analytics alias (admin panel uchun)
router.get('/analytics', protect, adminAuth, async (req, res) => {
  const { startDate, endDate } = req.query;
  const Order = require('../models/Order.model');
  const User = require('../models/User.model');

  const filter = {};
  if (startDate || endDate) {
    filter.createdAt = {};
    if (startDate) filter.createdAt.$gte = new Date(startDate);
    if (endDate) filter.createdAt.$lte = new Date(endDate);
  }

  const [totalOrders, totalRevenue, totalUsers] = await Promise.all([
    Order.countDocuments(filter),
    Order.aggregate([
      { $match: { ...filter, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]),
    User.countDocuments()
  ]);

  const revenue = totalRevenue[0]?.total || 0;

  res.json({
    success: true,
    data: {
      metrics: {
        totalRevenue: revenue,
        totalOrders,
        averageOrderValue: totalOrders > 0 ? Math.round(revenue / totalOrders) : 0,
        activeUsers: totalUsers
      },
      revenueData: [],
      ordersData: { byStatus: [] },
      vendorPerformance: [],
      driverPerformance: []
    }
  });
});
