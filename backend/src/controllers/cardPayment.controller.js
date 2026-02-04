const CardPayment = require('../models/CardPayment.model');
const Order = require('../models/Order.model');
const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const crypto = require('crypto');
const fs = require('fs');

/**
 * @desc    Create card payment record
 * @route   POST /api/v1/card-payments
 * @access  Private (Bot)
 */
const createCardPayment = asyncHandler(async (req, res, next) => {
  const { orderId, driverId, customerId, amount } = req.body;

  // Validate order exists and is card payment
  const order = await Order.findById(orderId);
  if (!order) {
    return next(new AppError('Order not found', 404));
  }
  if (order.paymentMethod !== 'card_to_driver') {
    return next(new AppError('Order is not a card payment order', 400));
  }

  // Check if payment record already exists
  const existingPayment = await CardPayment.findOne({ orderId });
  if (existingPayment) {
    return res.status(200).json({
      success: true,
      message: 'Card payment record already exists',
      data: { payment: existingPayment }
    });
  }

  // Create payment record
  const payment = await CardPayment.create({
    orderId,
    driverId,
    customerId,
    amount
  });

  logger.info(`Card payment created: ${payment._id} for order ${orderId}`);

  res.status(201).json({
    success: true,
    message: 'Card payment record created',
    data: { payment }
  });
});

/**
 * @desc    Upload receipt photo
 * @route   POST /api/v1/card-payments/:id/receipt
 * @access  Private (Bot)
 */
const uploadReceipt = asyncHandler(async (req, res, next) => {
  const payment = await CardPayment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Card payment not found', 404));
  }

  if (!req.file) {
    return next(new AppError('Please upload a receipt image', 400));
  }

  // Store receipt metadata
  const fileBuffer = fs.readFileSync(req.file.path);
  const imageHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');

  payment.receiptPhoto = req.file.path;
  payment.receiptMetadata = {
    uploadedAt: new Date(),
    fileSize: req.file.size,
    mimeType: req.file.mimetype,
    imageHash
  };

  await payment.save();

  logger.info(`Receipt uploaded for payment ${payment._id}`);

  res.status(200).json({
    success: true,
    message: 'Receipt uploaded successfully',
    data: { payment }
  });
});

/**
 * @desc    Verify payment (Admin)
 * @route   PUT /api/v1/card-payments/:id/verify
 * @access  Private/Admin
 */
const verifyPayment = asyncHandler(async (req, res, next) => {
  const payment = await CardPayment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Card payment not found', 404));
  }

  const { notes } = req.body;
  await payment.markAsVerified(req.user._id, notes);

  logger.info(`Payment ${payment._id} verified by admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Payment verified',
    data: { payment }
  });
});

/**
 * @desc    Reject payment (Admin)
 * @route   PUT /api/v1/card-payments/:id/reject
 * @access  Private/Admin
 */
const rejectPayment = asyncHandler(async (req, res, next) => {
  const payment = await CardPayment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Card payment not found', 404));
  }

  const { reason } = req.body;
  
  payment.adminVerified = false;
  payment.verificationNotes = reason;
  payment.settlementStatus = 'disputed';
  await payment.save();

  logger.info(`Payment ${payment._id} rejected by admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Payment rejected',
    data: { payment }
  });
});

/**
 * @desc    Get driver's card payments
 * @route   GET /api/v1/card-payments/driver/:driverId
 * @access  Private
 */
const getDriverPayments = asyncHandler(async (req, res, next) => {
  const { driverId } = req.params;
  const { startDate, endDate, status } = req.query;

  let query = { driverId };

  // Date range filter
  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = new Date(startDate);
    if (endDate) query.createdAt.$lte = new Date(endDate);
  }

  // Status filter
  if (status) {
    query.settlementStatus = status;
  }

  const payments = await CardPayment.find(query)
    .populate('orderId', 'orderNumber total')
    .populate('customerId', 'firstName lastName')
    .sort({ createdAt: -1 });

  // Calculate totals
  const totalAmount = payments.reduce((sum, p) => sum + p.amount, 0);
  const verifiedAmount = payments.filter(p => p.adminVerified).reduce((sum, p) => sum + p.amount, 0);
  const pendingAmount = payments.filter(p => p.settlementStatus === 'pending').reduce((sum, p) => sum + p.amount, 0);

  res.status(200).json({
    success: true,
    count: payments.length,
    data: {
      payments,
      summary: {
        totalAmount,
        verifiedAmount,
        pendingAmount
      }
    }
  });
});

/**
 * @desc    Get pending settlements
 * @route   GET /api/v1/card-payments/settlements/pending
 * @access  Private/Admin
 */
const getPendingSettlements = asyncHandler(async (req, res, next) => {
  const payments = await CardPayment.find({ settlementStatus: 'pending' })
    .populate('driverId', 'firstName lastName phone')
    .populate('orderId', 'orderNumber')
    .sort({ createdAt: -1 });

  // Group by driver
  const groupedByDriver = {};
  payments.forEach(payment => {
    const driverId = payment.driverId._id.toString();
    if (!groupedByDriver[driverId]) {
      groupedByDriver[driverId] = {
        driver: payment.driverId,
        payments: [],
        totalAmount: 0
      };
    }
    groupedByDriver[driverId].payments.push(payment);
    groupedByDriver[driverId].totalAmount += payment.amount;
  });

  res.status(200).json({
    success: true,
    data: {
      settlements: Object.values(groupedByDriver)
    }
  });
});

/**
 * @desc    Mark as settled
 * @route   PUT /api/v1/card-payments/:id/settle
 * @access  Private/Admin
 */
const markAsSettled = asyncHandler(async (req, res, next) => {
  const payment = await CardPayment.findById(req.params.id);

  if (!payment) {
    return next(new AppError('Card payment not found', 404));
  }

  await payment.markAsSettled(req.user._id);

  logger.info(`Payment ${payment._id} marked as settled by admin ${req.user._id}`);

  res.status(200).json({
    success: true,
    message: 'Payment marked as settled',
    data: { payment }
  });
});

/**
 * @desc    Get card payment by ID
 * @route   GET /api/v1/card-payments/:id
 * @access  Private
 */
const getCardPaymentById = asyncHandler(async (req, res, next) => {
  const payment = await CardPayment.findById(req.params.id)
    .populate('orderId')
    .populate('driverId', 'firstName lastName phone')
    .populate('customerId', 'firstName lastName phone');

  if (!payment) {
    return next(new AppError('Card payment not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { payment }
  });
});

/**
 * @desc    Get all card payments (Admin)
 * @route   GET /api/v1/card-payments
 * @access  Private/Admin
 */
const getAllCardPayments = asyncHandler(async (req, res, next) => {
  const { page = 1, limit = 50, status, verified } = req.query;
  
  let query = {};
  
  if (status) {
    query.settlementStatus = status;
  }
  
  if (verified === 'true') {
    query.adminVerified = true;
  } else if (verified === 'false') {
    query.adminVerified = false;
  }
  
  const payments = await CardPayment.find(query)
    .populate('orderId', 'orderNumber total')
    .populate('driverId', 'firstName lastName phone')
    .populate('customerId', 'firstName lastName phone')
    .sort({ createdAt: -1 })
    .limit(limit * 1)
    .skip((page - 1) * limit);
  
  const count = await CardPayment.countDocuments(query);
  
  res.status(200).json({
    success: true,
    count,
    data: {
      payments,
      totalPages: Math.ceil(count / limit),
      currentPage: page
    }
  });
});

module.exports = {
  createCardPayment,
  uploadReceipt,
  verifyPayment,
  rejectPayment,
  getDriverPayments,
  getPendingSettlements,
  markAsSettled,
  getCardPaymentById,
  getAllCardPayments
};
