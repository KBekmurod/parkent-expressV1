const express = require('express');
const {
  createReview,
  getReviewsByOrder,
  getReviewsByVendor,
  updateReview,
  deleteReview
} = require('../controllers/reviewController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, reviewSchema } = require('../middlewares/validator');

const router = express.Router();

router.post('/', protect, authorize('customer'), validate(reviewSchema), createReview);
router.get('/order/:orderId', protect, getReviewsByOrder);
router.get('/vendor/:vendorId', getReviewsByVendor);

router.route('/:id')
  .put(protect, authorize('customer'), updateReview)
  .delete(protect, authorize('customer', 'admin'), deleteReview);

module.exports = router;
