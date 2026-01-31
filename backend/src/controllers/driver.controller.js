const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const { deleteFile } = require('../utils/fileUpload');
const logger = require('../utils/logger');

/**
 * @desc    Register driver
 * @route   POST /api/v1/drivers/register
 * @access  Public (Telegram bot)
 */
const registerDriver = asyncHandler(async (req, res, next) => {
  const { telegramId, firstName, lastName, phone, vehicle } = req.body;

  // Check if driver exists
  const existingDriver = await Driver.findOne({ telegramId });
  if (existingDriver) {
    return next(new AppError('Driver already registered', 400));
  }

  // Create driver
  const driver = await Driver.create({
    telegramId,
    firstName,
    lastName,
    phone,
    vehicle,
    status: 'pending'
  });

  logger.info(`New driver registered: ${firstName} ${lastName}`);

  res.status(201).json({
    success: true,
    message: 'Driver registration submitted. Awaiting approval.',
    data: { driver }
  });
});

/**
 * @desc    Get driver by Telegram ID
 * @route   GET /api/v1/drivers/telegram/:telegramId
 * @access  Public (Telegram bot)
 */
const getDriverByTelegramId = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findOne({ telegramId: req.params.telegramId })
    .populate('currentOrders');

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { driver }
  });
});

/**
 * @desc    Get all drivers
 * @route   GET /api/v1/drivers
 * @access  Private/Admin
 */
const getAllDrivers = asyncHandler(async (req, res, next) => {
  const { status, isOnline, search, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (typeof isOnline !== 'undefined') query.isOnline = isOnline === 'true';
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { lastName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Driver.countDocuments(query);

  const drivers = await Driver.find(query)
    .sort({ isOnline: -1, rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: drivers.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { drivers }
  });
});

/**
 * @desc    Get driver by ID
 * @route   GET /api/v1/drivers/:id
 * @access  Private/Admin
 */
const getDriverById = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id)
    .populate('currentOrders');

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { driver }
  });
});

/**
 * @desc    Update driver location
 * @route   PUT /api/v1/drivers/:id/location
 * @access  Public (Telegram bot)
 */
const updateLocation = asyncHandler(async (req, res, next) => {
  const { lat, lng } = req.body;

  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { currentLocation: { lat, lng } },
    { new: true, runValidators: true }
  );

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  res.status(200).json({
    success: true,
    message: 'Location updated successfully',
    data: { driver }
  });
});

/**
 * @desc    Toggle driver online/offline
 * @route   PUT /api/v1/drivers/:id/toggle-online
 * @access  Public (Telegram bot)
 */
const toggleOnline = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  if (driver.status !== 'active') {
    return next(new AppError('Driver account is not active', 403));
  }

  driver.isOnline = !driver.isOnline;
  await driver.save();

  logger.info(`Driver ${driver.isOnline ? 'online' : 'offline'}: ${driver.firstName}`);

  res.status(200).json({
    success: true,
    message: `Driver is now ${driver.isOnline ? 'online' : 'offline'}`,
    data: { driver }
  });
});

/**
 * @desc    Upload driver document
 * @route   POST /api/v1/drivers/:id/document
 * @access  Public (Telegram bot)
 */
const uploadDocument = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  // Delete old document if exists
  if (driver.documentPhoto) {
    await deleteFile(driver.documentPhoto);
  }

  driver.documentPhoto = req.file.path;
  await driver.save();

  res.status(200).json({
    success: true,
    message: 'Document uploaded successfully',
    data: { driver }
  });
});

/**
 * @desc    Update driver status (Admin)
 * @route   PUT /api/v1/drivers/:id/status
 * @access  Private/Admin
 */
const updateDriverStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['pending', 'active', 'blocked'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  logger.info(`Driver status updated: ${driver.firstName} - ${status}`);

  res.status(200).json({
    success: true,
    message: `Driver ${status} successfully`,
    data: { driver }
  });
});

/**
 * @desc    Get available drivers (for order assignment)
 * @route   GET /api/v1/drivers/available
 * @access  Private
 */
const getAvailableDrivers = asyncHandler(async (req, res, next) => {
  const drivers = await Driver.find({
    status: 'active',
    isOnline: true,
    $expr: { $lt: [{ $size: '$currentOrders' }, 3] }
  }).select('firstName lastName phone vehicle currentLocation rating currentOrders');

  res.status(200).json({
    success: true,
    count: drivers.length,
    data: { drivers }
  });
});

module.exports = {
  registerDriver,
  getDriverByTelegramId,
  getAllDrivers,
  getDriverById,
  updateLocation,
  toggleOnline,
  uploadDocument,
  updateDriverStatus,
  getAvailableDrivers
};
