const express = require('express');
const router = express.Router();
const {
  createReview,
  getReviewsByVendor,
  getReviewsByDriver,
  getAllReviews,
  getReviewById,
  deleteReview,
  getCustomerReviews
} = require('../controllers/review.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { reviewSchemas } = require('../utils/validators');

// Admin routes
router.get('/', protect, adminAuth, getAllReviews);

// Public routes (Telegram bot)
// Note: Review creation is public to allow Telegram bot submissions
// In production, consider adding bot-specific authentication middleware
router.post('/', validate(reviewSchemas.create), createReview);
router.get('/vendor/:vendorId', validateObjectId('vendorId'), getReviewsByVendor);
router.get('/driver/:driverId', validateObjectId('driverId'), getReviewsByDriver);
router.get('/customer/:customerId', validateObjectId('customerId'), getCustomerReviews);
router.get('/:id', validateObjectId('id'), getReviewById);

// Admin delete route
router.delete('/:id', protect, adminAuth, validateObjectId('id'), deleteReview);

module.exports = router;
