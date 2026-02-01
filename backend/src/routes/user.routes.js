const express = require('express');
const router = express.Router();
const {
  registerUser,
  getUserByTelegramId,
  updateUserByTelegramId,
  getAllUsers,
  getUserById,
  addAddress,
  updateAddress,
  deleteAddress,
  updateUserStatus
} = require('../controllers/user.controller');
const { protect, adminAuth } = require('../middleware/auth.middleware');
const { validate, validateObjectId } = require('../middleware/validation.middleware');
const { userSchemas } = require('../utils/validators');

// Public routes (Telegram bot)
router.post('/register', validate(userSchemas.register), registerUser);
router.get('/telegram/:telegramId', getUserByTelegramId);
router.put('/telegram/:telegramId', updateUserByTelegramId); // For phone update
router.post('/:id/addresses', validateObjectId('id'), validate(userSchemas.addAddress), addAddress);
router.put('/:id/addresses/:addressIndex', validateObjectId('id'), validate(userSchemas.addAddress), updateAddress);
router.delete('/:id/addresses/:addressIndex', validateObjectId('id'), deleteAddress);

// Admin routes
router.get('/', protect, adminAuth, getAllUsers);
router.get('/:id', protect, adminAuth, validateObjectId('id'), getUserById);
router.put('/:id/status', protect, adminAuth, validateObjectId('id'), updateUserStatus);

module.exports = router;
