const Review = require('../models/Review.model');
const Order = require('../models/Order.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

/**
 * @desc    Create review
 * @route   POST /api/v1/reviews
 * @access  Public (Customer - Telegram bot)
 */
const createReview = asyncHandler(async (req, res, next) => {
  const { order, customer, vendor, driver, foodRating, deliveryRating, comment } = req.body;

  // Check if order exists and is delivered
  const orderExists = await Order.findById(order);
  
  if (!orderExists) {
    return next(new AppError('Order not found', 404));
  }

  if (orderExists.status !== 'delivered') {
    return next(new AppError('Can only review delivered orders', 400));
  }

  // Check if review already exists for this order
  const existingReview = await Review.findOne({ order });
  
  if (existingReview) {
    return next(new AppError('Review already submitted for this order', 400));
  }

  // Create review
  const review = await Review.create({
    order,
    customer,
    vendor,
    driver,
    foodRating,
    deliveryRating,
    comment
  });

  // Note: Rating update happens automatically via post-save hook in Review model

  logger.info(`New review created: Order ${order}`);

  // Populate review
  await review.populate([
    { path: 'customer', select: 'firstName lastName' },
    { path: 'vendor', select: 'name logo' },
    { path: 'driver', select: 'firstName lastName' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Review submitted successfully',
    data: { review }
  });
});

/**
 * @desc    Get reviews by vendor
 * @route   GET /api/v1/reviews/vendor/:vendorId
 * @access  Public
 */
const getReviewsByVendor = asyncHandler(async (req, res, next) => {
  let { page = 1, limit = 20 } = req.query;

  // Validate and sanitize pagination parameters
  page = Math.max(1, parseInt(page));
  limit = Math.min(100, Math.max(1, parseInt(limit)));

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Review.countDocuments({ vendor: req.params.vendorId });

  const reviews = await Review.find({ vendor: req.params.vendorId })
    .populate('customer', 'firstName lastName')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Calculate average ratings
  const stats = await Review.aggregate([
    { $match: { vendor: new mongoose.Types.ObjectId(req.params.vendorId) } },
    {
      $group: {
        _id: null,
        avgFoodRating: { $avg: '$foodRating' },
        avgOverallRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    stats: stats[0] || { avgFoodRating: 0, avgOverallRating: 0, totalReviews: 0 },
    data: { reviews }
  });
});

/**
 * @desc    Get reviews by driver
 * @route   GET /api/v1/reviews/driver/:driverId
 * @access  Public
 */
const getReviewsByDriver = asyncHandler(async (req, res, next) => {
  let { page = 1, limit = 20 } = req.query;

  // Validate and sanitize pagination parameters
  page = Math.max(1, parseInt(page));
  limit = Math.min(100, Math.max(1, parseInt(limit)));

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Review.countDocuments({ driver: req.params.driverId });

  const reviews = await Review.find({ driver: req.params.driverId })
    .populate('customer', 'firstName lastName')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  // Calculate average ratings
  const stats = await Review.aggregate([
    { $match: { driver: new mongoose.Types.ObjectId(req.params.driverId) } },
    {
      $group: {
        _id: null,
        avgDeliveryRating: { $avg: '$deliveryRating' },
        avgOverallRating: { $avg: '$rating' },
        totalReviews: { $sum: 1 }
      }
    }
  ]);

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    stats: stats[0] || { avgDeliveryRating: 0, avgOverallRating: 0, totalReviews: 0 },
    data: { reviews }
  });
});

/**
 * @desc    Get all reviews
 * @route   GET /api/v1/reviews
 * @access  Private/Admin
 */
const getAllReviews = asyncHandler(async (req, res, next) => {
  let { vendor, driver, customer, minRating, page = 1, limit = 20 } = req.query;

  // Validate and sanitize pagination parameters
  page = Math.max(1, parseInt(page));
  limit = Math.min(100, Math.max(1, parseInt(limit)));

  // Build query
  const query = {};
  if (vendor) query.vendor = vendor;
  if (driver) query.driver = driver;
  if (customer) query.customer = customer;
  if (minRating) query.rating = { $gte: parseFloat(minRating) };

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Review.countDocuments(query);

  const reviews = await Review.find(query)
    .populate('customer', 'firstName lastName')
    .populate('vendor', 'name')
    .populate('driver', 'firstName lastName')
    .populate('order', 'orderNumber')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: reviews.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { reviews }
  });
});

/**
 * @desc    Get review by ID
 * @route   GET /api/v1/reviews/:id
 * @access  Public
 */
const getReviewById = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id)
    .populate('customer', 'firstName lastName')
    .populate('vendor', 'name logo')
    .populate('driver', 'firstName lastName vehicle')
    .populate('order', 'orderNumber total');

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { review }
  });
});

/**
 * @desc    Delete review (Admin only)
 * @route   DELETE /api/v1/reviews/:id
 * @access  Private/Admin
 */
const deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(new AppError('Review not found', 404));
  }

  await review.deleteOne();

  // Note: Need to manually recalculate ratings after deletion
  // Recalculate vendor rating using aggregation
  if (review.vendor) {
    const vendorStats = await Review.aggregate([
      { $match: { vendor: review.vendor } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const avgRating = vendorStats.length > 0 
      ? Math.round(vendorStats[0].avgRating * 10) / 10 
      : 0;
    
    await Vendor.findByIdAndUpdate(review.vendor, { rating: avgRating });
  }

  // Recalculate driver rating using aggregation
  if (review.driver) {
    const driverStats = await Review.aggregate([
      { $match: { driver: review.driver, deliveryRating: { $exists: true } } },
      { $group: { _id: null, avgRating: { $avg: '$deliveryRating' } } }
    ]);
    
    const avgRating = driverStats.length > 0 
      ? Math.round(driverStats[0].avgRating * 10) / 10 
      : 0;
    
    await Driver.findByIdAndUpdate(review.driver, { rating: avgRating });
  }

  logger.info(`Review deleted: ${review._id}`);

  res.status(200).json({
    success: true,
    message: 'Review deleted successfully'
  });
});

/**
 * @desc    Get customer reviews (own reviews)
 * @route   GET /api/v1/reviews/customer/:customerId
 * @access  Public (Telegram bot)
 */
const getCustomerReviews = asyncHandler(async (req, res, next) => {
  const reviews = await Review.find({ customer: req.params.customerId })
    .populate('vendor', 'name logo')
    .populate('driver', 'firstName lastName')
    .populate('order', 'orderNumber total')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: reviews.length,
    data: { reviews }
  });
});

module.exports = {
  createReview,
  getReviewsByVendor,
  getReviewsByDriver,
  getAllReviews,
  getReviewById,
  deleteReview,
  getCustomerReviews
};
