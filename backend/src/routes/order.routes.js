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

// Public routes (Telegram bot)
router.post('/', orderLimiter, validate(orderSchemas.create), createOrder);
router.get('/customer/:customerId', validateObjectId('customerId'), getOrdersByCustomer);
router.get('/vendor/:vendorId', validateObjectId('vendorId'), getOrdersByVendor);
router.get('/driver/:driverId', validateObjectId('driverId'), getOrdersByDriver);
router.get('/:id', validateObjectId('id'), getOrderById);

// Vendor/Driver routes
router.put('/:id/status', validateObjectId('id'), validate(orderSchemas.updateStatus), updateOrderStatus);
router.put('/:id/cancel', validateObjectId('id'), cancelOrder);

// Admin routes
router.get('/', protect, adminAuth, getAllOrders);
router.put('/:id/assign-driver', validateObjectId('id'), assignDriver);

module.exports = router;
