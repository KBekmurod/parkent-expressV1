const express = require('express');
const router = express.Router();
const { register, login, getMe, updatePassword, webLogin, webRegister } = require('../controllers/auth.controller');
const { protect, adminAuth, authorize } = require('../middleware/auth.middleware');
const { validate } = require('../middleware/validation.middleware');
const { adminSchemas } = require('../utils/validators');
const { authLimiter } = require('../middleware/rateLimit.middleware');

// ADMIN_BYPASS=true bo'lsa validation'ni o'tkazib login() ni chaqiradi
const loginHandler = (req, res, next) => {
  if (process.env.ADMIN_BYPASS === 'true') {
    return login(req, res, next);
  }
  validate(adminSchemas.login)(req, res, (err) => {
    if (err) return next(err);
    login(req, res, next);
  });
};

router.post('/register', protect, adminAuth, authorize('super_admin'), validate(adminSchemas.register), register);
router.post('/login', authLimiter, loginHandler);
router.post('/admin/login', authLimiter, loginHandler);
router.get('/me', protect, adminAuth, getMe);
router.put('/password', protect, adminAuth, updatePassword);

router.post('/web/register', authLimiter, webRegister);
router.post('/web/login', authLimiter, webLogin);

module.exports = router;
