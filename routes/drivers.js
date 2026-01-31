const express = require('express');
const {
  registerDriver,
  getDrivers,
  getDriver,
  updateDriver,
  updateDriverStatus,
  getDriverOrders
} = require('../controllers/driverController');
const { protect, authorize } = require('../middlewares/auth');
const { validate, driverSchema } = require('../middlewares/validator');

const router = express.Router();

router.route('/')
  .get(protect, authorize('admin'), getDrivers)
  .post(protect, authorize('driver', 'admin'), validate(driverSchema), registerDriver);

router.route('/:id')
  .get(protect, getDriver)
  .put(protect, authorize('driver', 'admin'), updateDriver);

router.patch('/:id/status', protect, authorize('driver', 'admin'), updateDriverStatus);
router.get('/:id/orders', protect, authorize('driver', 'admin'), getDriverOrders);

module.exports = router;
