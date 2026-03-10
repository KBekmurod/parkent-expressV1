const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updatePassword,
  webLogin,
  webRegister
} = require('../controllers/auth.controller');
const { protect, adminAuth, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { adminSchemas } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimit.middleware');

router.post('/register', protect, adminAuth, authorize('super_admin'), validate(adminSchemas.register), register);
router.post('/login', authLimiter, validate(adminSchemas.login), login);
router.post('/admin/login', authLimiter, validate(adminSchemas.login), login);
router.get('/me', protect, adminAuth, getMe);
router.put('/password', protect, adminAuth, updatePassword);

// Web customer authentication
router.post('/web/register', authLimiter, webRegister);
router.post('/web/login', authLimiter, webLogin);

module.exports = router;
