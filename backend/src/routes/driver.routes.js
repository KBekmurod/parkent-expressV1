const express = require('express');
const router = express.Router();
const {
  registerDriver,
  getDriverByTelegramId,
  getAllDrivers,
  getDriverById,
  updateLocation,
  toggleOnline,
  uploadDocument,
  updateDriverStatus,
  getAvailableDrivers,
  getDriverEarnings,
  getDriverStats
} = require('../controllers/driver.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { driverSchemas } = require('../utils/validators');
const { uploadSingle } = require('../middleware/upload.middleware');

// Public routes (Telegram bot)
router.post('/register', validate(driverSchemas.register), registerDriver);
router.get('/telegram/:telegramId', getDriverByTelegramId);
router.put('/:id/location', validateObjectId('id'), validate(driverSchemas.updateLocation), updateLocation);
router.put('/:id/toggle-online', validateObjectId('id'), toggleOnline);
router.post('/:id/document', validateObjectId('id'), uploadSingle('documentPhoto'), uploadDocument);
router.get('/:id/earnings', validateObjectId('id'), getDriverEarnings);
router.get('/:id/stats', validateObjectId('id'), getDriverStats);

// Admin routes
router.get('/', protect, adminAuth, getAllDrivers);
router.get('/available', protect, getAvailableDrivers);
router.get('/:id', validateObjectId('id'), getDriverById);
router.put('/:id/status', protect, adminAuth, validateObjectId('id'), updateDriverStatus);

module.exports = router;
