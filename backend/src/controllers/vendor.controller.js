const Vendor = require('../models/Vendor.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const { deleteFile } = require('../utils/fileUpload');
const logger = require('../utils/logger');

/**
 * @desc    Register vendor
 * @route   POST /api/v1/vendors/register
 * @access  Public (Telegram bot)
 */
const registerVendor = asyncHandler(async (req, res, next) => {
  const {
    telegramId,
    name,
    description,
    category,
    phone,
    location,
    address,
    workingHours
  } = req.body;

  // Check if vendor exists
  const existingVendor = await Vendor.findOne({ telegramId });
  if (existingVendor) {
    return next(new AppError('Vendor already registered', 400));
  }

  // Create vendor
  const vendor = await Vendor.create({
    telegramId,
    name,
    description,
    category,
    phone,
    location,
    address,
    workingHours,
    status: 'pending'
  });

  logger.info(`New vendor registered: ${name}`);

  res.status(201).json({
    success: true,
    message: 'Vendor registration submitted. Awaiting approval.',
    data: { vendor }
  });
});

/**
 * @desc    Get vendor by Telegram ID
 * @route   GET /api/v1/vendors/telegram/:telegramId
 * @access  Public (Telegram bot)
 */
const getVendorByTelegramId = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findOne({ telegramId: req.params.telegramId });

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { vendor }
  });
});

/**
 * @desc    Get all vendors
 * @route   GET /api/v1/vendors
 * @access  Public
 */
const getAllVendors = asyncHandler(async (req, res, next) => {
  const { status, category, search, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (category) query.category = category;
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Vendor.countDocuments(query);

  const vendors = await Vendor.find(query)
    .sort({ rating: -1, createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: vendors.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { vendors }
  });
});

/**
 * @desc    Get vendor by ID
 * @route   GET /api/v1/vendors/:id
 * @access  Public
 */
const getVendorById = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { vendor }
  });
});

/**
 * @desc    Update vendor
 * @route   PUT /api/v1/vendors/:id
 * @access  Private (Vendor or Admin)
 */
const updateVendor = asyncHandler(async (req, res, next) => {
  let vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  const { name, description, category, phone, workingHours, isOpen } = req.body;

  // Update fields
  if (name) vendor.name = name;
  if (description) vendor.description = description;
  if (category) vendor.category = category;
  if (phone) vendor.phone = phone;
  if (workingHours) vendor.workingHours = workingHours;
  if (typeof isOpen !== 'undefined') vendor.isOpen = isOpen;

  await vendor.save();

  res.status(200).json({
    success: true,
    message: 'Vendor updated successfully',
    data: { vendor }
  });
});

/**
 * @desc    Upload vendor logo
 * @route   POST /api/v1/vendors/:id/logo
 * @access  Private (Vendor or Admin)
 */
const uploadLogo = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a file', 400));
  }

  // Delete old logo if exists
  if (vendor.logo) {
    await deleteFile(vendor.logo);
  }

  vendor.logo = req.file.path;
  await vendor.save();

  res.status(200).json({
    success: true,
    message: 'Logo uploaded successfully',
    data: { vendor }
  });
});

/**
 * @desc    Update vendor status (Admin)
 * @route   PUT /api/v1/vendors/:id/status
 * @access  Private/Admin
 */
const updateVendorStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  if (!['pending', 'active', 'blocked', 'closed'].includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status },
    { new: true, runValidators: true }
  );

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  logger.info(`Vendor status updated: ${vendor.name} - ${status}`);

  res.status(200).json({
    success: true,
    message: `Vendor ${status} successfully`,
    data: { vendor }
  });
});

/**
 * @desc    Toggle vendor open/close
 * @route   PUT /api/v1/vendors/:id/toggle
 * @access  Private (Vendor)
 */
const toggleVendorOpen = asyncHandler(async (req, res, next) => {
  const vendor = await Vendor.findById(req.params.id);

  if (!vendor) {
    return next(new AppError('Vendor not found', 404));
  }

  vendor.isOpen = !vendor.isOpen;
  await vendor.save();

  res.status(200).json({
    success: true,
    message: `Vendor is now ${vendor.isOpen ? 'open' : 'closed'}`,
    data: { vendor }
  });
});

module.exports = {
  registerVendor,
  getVendorByTelegramId,
  getAllVendors,
  getVendorById,
  updateVendor,
  uploadLogo,
  updateVendorStatus,
  toggleVendorOpen
};
