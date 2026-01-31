const express = require('express');
const {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  updateOrderStatus,
  cancelOrder
} = require('../controllers/orderController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, orderSchema } = require('../middlewares/validator');

const router = express.Router();

router.use(protect);

router.route('/')
  .get(getOrders)
  .post(authorize('customer'), validate(orderSchema), createOrder);

router.route('/:id')
  .get(getOrder)
  .put(authorize('vendor', 'admin'), updateOrder)
  .delete(authorize('customer', 'admin'), cancelOrder);

router.patch('/:id/status', authorize('vendor', 'driver', 'admin'), updateOrderStatus);

module.exports = router;
