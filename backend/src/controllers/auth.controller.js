const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * Generate JWT token
 */
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d'
  });
};

/**
 * @desc    Register new admin
 * @route   POST /api/v1/auth/register
 * @access  Private (super_admin only)
 */
const register = asyncHandler(async (req, res, next) => {
  const { username, email, password, firstName, lastName, role } = req.body;

  // Check if admin exists
  const existingAdmin = await Admin.findOne({
    $or: [{ email }, { username }]
  });

  if (existingAdmin) {
    return next(new AppError('Admin with this email or username already exists', 400));
  }

  // Create admin
  const admin = await Admin.create({
    username,
    email,
    password,
    firstName,
    lastName,
    role: role || 'operator'
  });

  logger.info(`New admin registered: ${admin.username}`);

  res.status(201).json({
    success: true,
    message: 'Admin registered successfully',
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      }
    }
  });
});

/**
 * @desc    Login admin
 * @route   POST /api/v1/auth/login
 * @route   POST /api/v1/auth/admin/login
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, username, password } = req.body;

  // Validate input
  if ((!email && !username) || !password) {
    return next(new AppError('Please provide email or username and password', 400));
  }

  // Build query to find admin by email or username
  const queryConditions = [];
  if (email) {
    queryConditions.push({ email });
  }
  if (username) {
    queryConditions.push({ username });
  }

  // Find admin by email or username
  const admin = await Admin.findOne({ $or: queryConditions }).select('+password');

  if (!admin) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Check if admin is active
  if (!admin.isActive) {
    return next(new AppError('Account is deactivated', 403));
  }

  // Check password
  const isPasswordMatch = await admin.comparePassword(password);

  if (!isPasswordMatch) {
    return next(new AppError('Invalid credentials', 401));
  }

  // Update last login
  admin.lastLogin = new Date();
  await admin.save();

  // Generate token
  const token = generateToken(admin._id);

  logger.info(`Admin logged in: ${admin.username}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      admin: {
        id: admin._id,
        username: admin.username,
        email: admin.email,
        firstName: admin.firstName,
        lastName: admin.lastName,
        role: admin.role
      },
      token
    }
  });
});

/**
 * @desc    Get current admin profile
 * @route   GET /api/v1/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  const admin = await Admin.findById(req.user.id);

  if (!admin) {
    return next(new AppError('Admin not found', 404));
  }

  res.status(200).json({
    success: true,
    data: {
      admin
    }
  });
});

/**
 * @desc    Update admin password
 * @route   PUT /api/v1/auth/password
 * @access  Private
 */
const updatePassword = asyncHandler(async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return next(new AppError('Please provide current and new password', 400));
  }

  const admin = await Admin.findById(req.user.id).select('+password');

  // Check current password
  const isMatch = await admin.comparePassword(currentPassword);
  if (!isMatch) {
    return next(new AppError('Current password is incorrect', 401));
  }

  // Update password
  admin.password = newPassword;
  await admin.save();

  logger.info(`Admin password updated: ${admin.username}`);

  res.status(200).json({
    success: true,
    message: 'Password updated successfully'
  });
});

/**
 * @desc    Web mijozni ro'yxatdan o'tkazish
 * @route   POST /api/v1/auth/web/register
 * @access  Public
 */
const webRegister = asyncHandler(async (req, res, next) => {
  const { phone, pin, firstName, lastName } = req.body;

  if (!phone || !pin) {
    return next(new AppError('Telefon raqam va PIN kiritish majburiy', 400));
  }

  if (!/^\d{4}$/.test(pin)) {
    return next(new AppError('PIN 4 xonali raqam bo\'lishi kerak', 400));
  }

  // Mavjudligini tekshirish (webPhone maydoni bo'yicha)
  const existingUser = await User.findOne({ webPhone: phone });
  if (existingUser) {
    return next(new AppError('Bu telefon raqam allaqachon ro\'yxatdan o\'tgan', 400));
  }

  // PIN ni hash qilish
  const hashedPin = await bcrypt.hash(pin, 10);

  // Web foydalanuvchi yaratish (webPhone — alohida maydon)
  const user = await User.create({
    webPhone: phone,
    phone,
    firstName: firstName || 'Foydalanuvchi',
    lastName: lastName || '',
    webPin: hashedPin,
    authType: 'web'
    // telegramId yo'q — bu web foydalanuvchi
  });

  const token = generateToken(user._id);

  logger.info(`Yangi web foydalanuvchi ro'yxatdan o'tdi: ${phone}`);

  res.status(201).json({
    success: true,
    message: 'Muvaffaqiyatli ro\'yxatdan o\'tdingiz',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    }
  });
});

/**
 * @desc    Web mijozni tizimga kiritish
 * @route   POST /api/v1/auth/web/login
 * @access  Public
 */
const webLogin = asyncHandler(async (req, res, next) => {
  const { phone, pin } = req.body;

  if (!phone || !pin) {
    return next(new AppError('Telefon raqam va PIN kiritish majburiy', 400));
  }

  if (!/^\d{4}$/.test(pin)) {
    return next(new AppError('PIN 4 xonali raqam bo\'lishi kerak', 400));
  }

  // webPhone maydoni bo'yicha web foydalanuvchini topish
  const user = await User.findOne({ webPhone: phone }).select('+webPin');

  if (!user) {
    return next(new AppError('Foydalanuvchi topilmadi. Avval ro\'yxatdan o\'ting', 404));
  }

  if (user.status === 'blocked') {
    return next(new AppError('Hisobingiz bloklangan', 403));
  }

  if (!user.webPin) {
    return next(new AppError('Noto\'g\'ri PIN', 401));
  }

  const isPinValid = await bcrypt.compare(pin, user.webPin);
  if (!isPinValid) {
    return next(new AppError('Noto\'g\'ri PIN', 401));
  }

  const token = generateToken(user._id);

  logger.info(`Web foydalanuvchi kirdi: ${phone}`);

  res.status(200).json({
    success: true,
    message: 'Muvaffaqiyatli kirdingiz',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone
      },
      token
    }
  });
});

module.exports = {
  register,
  login,
  getMe,
  updatePassword,
  webRegister,
  webLogin
};
