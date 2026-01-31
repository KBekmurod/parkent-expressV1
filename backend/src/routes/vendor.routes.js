const express = require('express');
const router = express.Router();
const {
  registerVendor,
  getVendorByTelegramId,
  getAllVendors,
  getVendorById,
  updateVendor,
  uploadLogo,
  updateVendorStatus,
  toggleVendorOpen
} = require('../controllers/vendor.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { vendorSchemas } = require('../utils/validators');
const { uploadSingle } = require('../middleware/upload.middleware');

// Public routes
router.get('/', getAllVendors);
router.get('/:id', validateObjectId('id'), getVendorById);
router.get('/telegram/:telegramId', getVendorByTelegramId);

// Vendor registration (Telegram bot)
router.post('/register', validate(vendorSchemas.register), registerVendor);

// Vendor routes
router.put('/:id', validateObjectId('id'), validate(vendorSchemas.update), updateVendor);
router.post('/:id/logo', validateObjectId('id'), uploadSingle('logo'), uploadLogo);
router.put('/:id/toggle', validateObjectId('id'), toggleVendorOpen);

// Admin routes
router.put('/:id/status', protect, adminAuth, validateObjectId('id'), updateVendorStatus);

module.exports = router;
