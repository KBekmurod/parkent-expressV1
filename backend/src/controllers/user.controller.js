const User = require('../models/User.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Register/Get user by Telegram ID
 * @route   POST /api/v1/users/register
 * @access  Public (Telegram bot)
 */
const registerUser = asyncHandler(async (req, res, next) => {
  const { telegramId, firstName, lastName, username, phone } = req.body;

  // Check if user exists
  let user = await User.findOne({ telegramId });
  let isNewUser = false;

  if (user) {
    // Update user info if provided
    if (phone && phone !== user.phone) {
      user.phone = phone;
      await user.save();
    }
    
    return res.status(200).json({
      success: true,
      message: 'User already exists',
      data: { user, isNewUser: false }
    });
  }

  // Create new user
  user = await User.create({
    telegramId,
    firstName,
    lastName,
    phone: phone || ''
  });

  isNewUser = true;
  logger.info(`New user registered: ${telegramId}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: { user, isNewUser }
  });
});

/**
 * @desc    Get user by Telegram ID
 * @route   GET /api/v1/users/telegram/:telegramId
 * @access  Public (Telegram bot)
 */
const getUserByTelegramId = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ telegramId: req.params.telegramId });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * @desc    Update user by Telegram ID
 * @route   PUT /api/v1/users/telegram/:telegramId
 * @access  Public (Telegram bot)
 */
const updateUserByTelegramId = asyncHandler(async (req, res, next) => {
  const { phone, firstName, lastName } = req.body;
  
  const user = await User.findOne({ telegramId: req.params.telegramId });

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  // Update fields if provided
  if (phone) user.phone = phone;
  if (firstName) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'User updated successfully',
    data: { user }
  });
});

/**
 * @desc    Get all users (Admin)
 * @route   GET /api/v1/users
 * @access  Private/Admin
 */
const getAllUsers = asyncHandler(async (req, res, next) => {
  const { status, search, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);

  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: users.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { users }
  });
});

/**
 * @desc    Get user by ID
 * @route   GET /api/v1/users/:id
 * @access  Private/Admin
 */
const getUserById = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { user }
  });
});

/**
 * @desc    Add user address
 * @route   POST /api/v1/users/:id/addresses
 * @access  Public (Telegram bot)
 */
const addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const { title, location, address, isDefault } = req.body;

  // If this is default, unset others
  if (isDefault) {
    user.addresses.forEach(addr => {
      addr.isDefault = false;
    });
  }

  user.addresses.push({
    title,
    location,
    address,
    isDefault: isDefault || user.addresses.length === 0
  });

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address added successfully',
    data: { user }
  });
});

/**
 * @desc    Update user address
 * @route   PUT /api/v1/users/:id/addresses/:addressIndex
 * @access  Public (Telegram bot)
 */
const updateAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const addressIndex = parseInt(req.params.addressIndex);
  if (addressIndex < 0 || addressIndex >= user.addresses.length) {
    return next(new AppError('Invalid address index', 400));
  }

  const { title, location, address, isDefault } = req.body;

  // If setting as default, unset others
  if (isDefault) {
    user.addresses.forEach((addr, idx) => {
      addr.isDefault = idx === addressIndex;
    });
  }

  if (title) user.addresses[addressIndex].title = title;
  if (location) user.addresses[addressIndex].location = location;
  if (address) user.addresses[addressIndex].address = address;

  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address updated successfully',
    data: { user }
  });
});

/**
 * @desc    Delete user address
 * @route   DELETE /api/v1/users/:id/addresses/:addressIndex
 * @access  Public (Telegram bot)
 */
const deleteAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  const addressIndex = parseInt(req.params.addressIndex);
  if (addressIndex < 0 || addressIndex >= user.addresses.length) {
    return next(new AppError('Invalid address index', 400));
  }

  user.addresses.splice(addressIndex, 1);
  await user.save();

  res.status(200).json({
    success: true,
    message: 'Address deleted successfully',
    data: { user }
  });
});

/**
 * @desc    Block/Unblock user
 * @route   PUT /api/v1/users/:id/status
 * @access  Private/Admin
 */
const updateUserStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['active', 'blocked'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const user = await User.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!user) {
    return next(new AppError('User not found', 404));
  }

  logger.info(`User status updated: ${user.telegramId} - ${status}`);

  res.status(200).json({
    success: true,
    message: `User ${status} successfully`,
    data: { user }
  });
});

module.exports = {
  registerUser,
  getUserByTelegramId,
  updateUserByTelegramId,
  getAllUsers,
  getUserById,
  addAddress,
  updateAddress,
  deleteAddress,
  updateUserStatus
};
