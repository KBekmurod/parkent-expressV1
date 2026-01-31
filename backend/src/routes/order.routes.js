const express = require('express');
const router = express.Router();
const {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  getOrdersByVendor,
  getOrdersByDriver,
  updateOrderStatus,
  assignDriver,
  cancelOrder
} = require('../controllers/order.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { orderSchemas } = require('../utils/validators');
const { orderLimiter } = require('../middleware/rateLimit.middleware');

// Admin routes (must come before generic routes)
router.get('/', protect, adminAuth, getAllOrders);

// Public routes (Telegram bot)
router.post('/', orderLimiter, validate(orderSchemas.create), createOrder);
router.get('/customer/:customerId', validateObjectId('customerId'), getOrdersByCustomer);
router.get('/vendor/:vendorId', validateObjectId('vendorId'), getOrdersByVendor);
router.get('/driver/:driverId', validateObjectId('driverId'), getOrdersByDriver);
router.get('/:id', validateObjectId('id'), getOrderById);

// Vendor/Driver routes
router.put('/:id/status', protect, validateObjectId('id'), validate(orderSchemas.updateStatus), updateOrderStatus);
router.put('/:id/cancel', protect, validateObjectId('id'), cancelOrder);

// Admin routes
router.put('/:id/assign-driver', protect, adminAuth, validateObjectId('id'), assignDriver);

module.exports = router;
