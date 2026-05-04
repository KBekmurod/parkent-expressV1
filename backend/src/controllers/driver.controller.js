const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const { deleteFile } = require('../utils/fileUpload');
const logger = require('../utils/logger');
const { notifyAdminNewDriver } = require('../services/notification.service');

/**
 * @desc    Register driver
 * @route   POST /api/v1/drivers/register
 * @access  Public (Telegram bot)
 */
const registerDriver = asyncHandler(async (req, res, next) => {
  const { 
    telegramId, 
    firstName, 
    lastName, 
    username,
    phone, 
    vehicle,
    vehicleModel,
    plateNumber,
    licensePhoto,
    vehiclePhoto,
    status 
  } = req.body;

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
    username,
    phone,
    vehicle,
    vehicleModel,
    plateNumber,
    licensePhoto,
    vehiclePhoto,
    status: status || 'pending'
  });

  logger.info(`New driver registered: ${firstName} ${lastName}`);

  // Admin'larga Telegram xabar (background)
  notifyAdminNewDriver(driver).catch(err =>
    logger.warn('Admin driver notify:', err.message)
  );

  // Socket orqali admin panel'ga real-time bildirishnoma
  try {
    const { getIO } = require('../socket');
    const io = getIO();
    io.to('admin').emit('driver:new_registration', {
      firstName: driver.firstName,
      lastName: driver.lastName,
      phone: driver.phone,
      vehicle: driver.vehicle
    });
  } catch (err) {
    // Socket ishlamasa ham davom etamiz
  }

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
 * @desc    Haydovchini online/offline qilish
 * @route   PUT /api/v1/drivers/:id/toggle-online
 * @access  Public (Telegram bot)
 */
const toggleOnline = asyncHandler(async (req, res, next) => {
  const driver = await Driver.findById(req.params.id);

  if (!driver) {
    return next(new AppError('Haydovchi topilmadi', 404));
  }

  if (driver.status !== 'active') {
    return next(new AppError('Hisob faol emas', 403));
  }

  // req.body.isOnline berilgan bo'lsa — uni ishlatamiz, aks holda toggle qilamiz
  const targetOnline = typeof req.body.isOnline === 'boolean'
    ? req.body.isOnline
    : !driver.isOnline;

  // Agar haydovchi offline bo'lmoqchi bo'lsa va faol buyurtmalari bo'lsa — taqiqlash
  if (!targetOnline && driver.currentOrders && driver.currentOrders.length > 0) {
    return next(new AppError(
      `Sizda ${driver.currentOrders.length} ta faol buyurtma bor. Avval ularni yetkazib bering.`,
      400
    ));
  }

  driver.isOnline = targetOnline;
  await driver.save();

  logger.info(`Haydovchi ${driver.isOnline ? 'online' : 'offline'}: ${driver.firstName}`);

  res.status(200).json({
    success: true,
    message: `Haydovchi endi ${driver.isOnline ? 'online' : 'offline'}`,
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

/**
 * @desc    Driver daromadini olish (bot uchun)
 * @route   GET /api/v1/drivers/:id/earnings
 * @access  Public (bot)
 */
const getDriverEarnings = asyncHandler(async (req, res, next) => {
  const Order = require('../models/Order.model');
  const driverId = req.params.id;

  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(now);
  weekStart.setDate(now.getDate() - 7);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const [daily, weekly, monthly, total] = await Promise.all([
    Order.aggregate([
      { $match: { driver: require('mongoose').Types.ObjectId.createFromHexString(driverId), status: 'delivered', createdAt: { $gte: todayStart } } },
      { $group: { _id: null, amount: { $sum: '$deliveryFee' }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { driver: require('mongoose').Types.ObjectId.createFromHexString(driverId), status: 'delivered', createdAt: { $gte: weekStart } } },
      { $group: { _id: null, amount: { $sum: '$deliveryFee' }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { driver: require('mongoose').Types.ObjectId.createFromHexString(driverId), status: 'delivered', createdAt: { $gte: monthStart } } },
      { $group: { _id: null, amount: { $sum: '$deliveryFee' }, count: { $sum: 1 } } }
    ]),
    Order.aggregate([
      { $match: { driver: require('mongoose').Types.ObjectId.createFromHexString(driverId), status: 'delivered' } },
      { $group: { _id: null, amount: { $sum: '$deliveryFee' }, count: { $sum: 1 } } }
    ]),
  ]);

  res.json({
    success: true,
    data: {
      daily: daily[0] || { amount: 0, count: 0 },
      weekly: weekly[0] || { amount: 0, count: 0 },
      monthly: monthly[0] || { amount: 0, count: 0 },
      total: total[0] || { amount: 0, count: 0 },
    }
  });
});

/**
 * @desc    Driver statistikasini olish (bot uchun)
 * @route   GET /api/v1/drivers/:id/stats
 * @access  Public (bot)
 */
const getDriverStats = asyncHandler(async (req, res, next) => {
  const Order = require('../models/Order.model');
  const driverId = req.params.id;
  const mongoose = require('mongoose');
  const id = mongoose.Types.ObjectId.createFromHexString(driverId);

  const [completed, cancelled, total] = await Promise.all([
    Order.countDocuments({ driver: id, status: 'delivered' }),
    Order.countDocuments({ driver: id, status: 'cancelled' }),
    Order.countDocuments({ driver: id }),
  ]);

  const totalCount = completed + cancelled;
  const completionRate = totalCount > 0 ? Math.round((completed / totalCount) * 100) : 0;

  res.json({
    success: true,
    data: {
      completedOrders: completed,
      cancelledOrders: cancelled,
      completionRate,
      averageRating: 0,
      totalReviews: 0,
      totalEarnings: 0,
    }
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
  getAvailableDrivers,
  getDriverEarnings,
  getDriverStats
};
