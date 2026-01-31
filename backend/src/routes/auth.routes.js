const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword
} = require('../controllers/auth.controller');
const { protect, adminAuth, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { adminSchemas } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', protect, adminAuth, authorize('super_admin'), validate(adminSchemas.register), register);
router.post('/login', authLimiter, validate(adminSchemas.login), login);
router.get('/me', protect, adminAuth, getMe);
router.put('/password', protect, adminAuth, updatePassword);

module.exports = router;
