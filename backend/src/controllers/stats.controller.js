const mongoose = require('mongoose');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');
const Transaction = require('../models/Transaction.model');
const Review = require('../models/Review.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');

/**
 * @desc    Get dashboard stats
 * @route   GET /api/v1/stats/dashboard
 * @access  Private/Admin
 */
const getDashboardStats = asyncHandler(async (req, res, next) => {
  // Total counts
  const totalUsers = await User.countDocuments({ status: 'active' });
  const totalVendors = await Vendor.countDocuments({ status: 'active' });
  const totalDrivers = await Driver.countDocuments({ status: 'active' });
  const totalOrders = await Order.countDocuments();

  // Today's stats
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({
    createdAt: { $gte: today }
  });

  const todayRevenue = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: today },
        status: 'completed',
        type: 'payment'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Order status breakdown
  const ordersByStatus = await Order.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 }
      }
    }
  ]);

  // Total revenue
  const totalRevenue = await Transaction.aggregate([
    {
      $match: {
        status: 'completed',
        type: 'payment',
        toModel: 'Platform'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Average rating
  const avgRating = await Review.aggregate([
    { $group: { _id: null, avg: { $avg: '$rating' } } }
  ]);

  // Online drivers
  const onlineDrivers = await Driver.countDocuments({
    isOnline: true,
    status: 'active'
  });

  res.status(200).json({
    success: true,
    data: {
      users: totalUsers,
      vendors: totalVendors,
      drivers: totalDrivers,
      orders: totalOrders,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalRevenue: totalRevenue[0]?.total || 0,
      ordersByStatus: ordersByStatus.reduce((acc, item) => {
        acc[item._id] = item.count;
        return acc;
      }, {}),
      averageRating: avgRating[0]?.avg || 0,
      onlineDrivers
    }
  });
});

/**
 * @desc    Get order analytics
 * @route   GET /api/v1/stats/orders
 * @access  Private/Admin
 */
const getOrderAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'daily', days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  let groupFormat;
  if (period === 'daily') {
    groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  } else if (period === 'weekly') {
    groupFormat = { 
      $concat: [
        { $toString: { $isoWeekYear: '$createdAt' } },
        '-W',
        { $toString: { $isoWeek: '$createdAt' } }
      ]
    };
  } else if (period === 'monthly') {
    groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  } else {
    groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const orderStats = await Order.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate }
      }
    },
    {
      $group: {
        _id: groupFormat,
        count: { $sum: 1 },
        totalRevenue: { $sum: '$total' },
        avgOrderValue: { $avg: '$total' }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: { orderStats }
  });
});

/**
 * @desc    Get vendor stats
 * @route   GET /api/v1/stats/vendor/:vendorId
 * @access  Public (Telegram bot)
 */
const getVendorStats = asyncHandler(async (req, res, next) => {
  const vendorId = req.params.vendorId;

  // Total orders
  const totalOrders = await Order.countDocuments({
    vendor: vendorId,
    status: { $in: ['delivered', 'cancelled'] }
  });

  // Active orders
  const activeOrders = await Order.countDocuments({
    vendor: vendorId,
    status: { $nin: ['delivered', 'cancelled', 'rejected'] }
  });

  // Revenue stats
  const revenueStats = await Order.aggregate([
    {
      $match: {
        vendor: new mongoose.Types.ObjectId(vendorId),
        status: 'delivered'
      }
    },
    {
      $group: {
        _id: null,
        totalRevenue: { $sum: '$subtotal' },
        avgOrderValue: { $avg: '$subtotal' },
        totalOrders: { $sum: 1 }
      }
    }
  ]);

  // Rating stats
  const ratingStats = await Review.aggregate([
    {
      $match: { vendor: new mongoose.Types.ObjectId(vendorId) }
    },
    {
      $group: {
        _id: null,
        avgFoodRating: { $avg: '$foodRating' },
        avgOverallRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  // Today's orders
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayOrders = await Order.countDocuments({
    vendor: vendorId,
    createdAt: { $gte: today }
  });

  const todayRevenue = await Order.aggregate([
    {
      $match: {
        vendor: new mongoose.Types.ObjectId(vendorId),
        createdAt: { $gte: today },
        status: 'delivered'
      }
    },
    { $group: { _id: null, total: { $sum: '$subtotal' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalOrders,
      activeOrders,
      todayOrders,
      todayRevenue: todayRevenue[0]?.total || 0,
      totalRevenue: revenueStats[0]?.totalRevenue || 0,
      avgOrderValue: revenueStats[0]?.avgOrderValue || 0,
      avgFoodRating: ratingStats[0]?.avgFoodRating || 0,
      avgOverallRating: ratingStats[0]?.avgOverallRating || 0,
      totalReviews: ratingStats[0]?.totalReviews || 0
    }
  });
});

/**
 * @desc    Get driver stats
 * @route   GET /api/v1/stats/driver/:driverId
 * @access  Public (Telegram bot)
 */
const getDriverStats = asyncHandler(async (req, res, next) => {
  const driverId = req.params.driverId;

  // Total deliveries
  const totalDeliveries = await Order.countDocuments({
    driver: driverId,
    status: 'delivered'
  });

  // Active deliveries
  const activeDeliveries = await Order.countDocuments({
    driver: driverId,
    status: { $in: ['assigned', 'picked_up', 'on_the_way'] }
  });

  // Earnings
  const earnings = await Transaction.aggregate([
    {
      $match: {
        to: new mongoose.Types.ObjectId(driverId),
        toModel: 'Driver',
        status: 'completed',
        type: 'payment'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  // Rating stats
  const ratingStats = await Review.aggregate([
    {
      $match: { driver: new mongoose.Types.ObjectId(driverId) }
    },
    {
      $group: {
        _id: null,
        avgDeliveryRating: { $avg: '$deliveryRating' },
        avgOverallRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  // Today's deliveries
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const todayDeliveries = await Order.countDocuments({
    driver: driverId,
    updatedAt: { $gte: today },
    status: 'delivered'
  });

  const todayEarnings = await Transaction.aggregate([
    {
      $match: {
        to: new mongoose.Types.ObjectId(driverId),
        toModel: 'Driver',
        createdAt: { $gte: today },
        status: 'completed',
        type: 'payment'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    data: {
      totalDeliveries,
      activeDeliveries,
      todayDeliveries,
      todayEarnings: todayEarnings[0]?.total || 0,
      totalEarnings: earnings[0]?.total || 0,
      avgDeliveryRating: ratingStats[0]?.avgDeliveryRating || 0,
      avgOverallRating: ratingStats[0]?.avgOverallRating || 0,
      totalReviews: ratingStats[0]?.totalReviews || 0
    }
  });
});

/**
 * @desc    Get revenue analytics
 * @route   GET /api/v1/stats/revenue
 * @access  Private/Admin
 */
const getRevenueAnalytics = asyncHandler(async (req, res, next) => {
  const { period = 'daily', days = 7 } = req.query;

  const startDate = new Date();
  startDate.setDate(startDate.getDate() - parseInt(days));
  startDate.setHours(0, 0, 0, 0);

  let groupFormat;
  if (period === 'daily') {
    groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  } else if (period === 'monthly') {
    groupFormat = { $dateToString: { format: '%Y-%m', date: '$createdAt' } };
  } else {
    groupFormat = { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } };
  }

  const revenueStats = await Transaction.aggregate([
    {
      $match: {
        createdAt: { $gte: startDate },
        status: 'completed'
      }
    },
    {
      $group: {
        _id: {
          date: groupFormat,
          type: '$type'
        },
        total: { $sum: '$amount' },
        count: { $sum: 1 }
      }
    },
    { $sort: { '_id.date': 1 } }
  ]);

  res.status(200).json({
    success: true,
    data: { revenueStats }
  });
});

module.exports = {
  getDashboardStats,
  getOrderAnalytics,
  getVendorStats,
  getDriverStats,
  getRevenueAnalytics
};
