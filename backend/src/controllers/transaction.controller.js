const mongoose = require('mongoose');
const Transaction = require('../models/Transaction.model');
const Order = require('../models/Order.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');

/**
 * @desc    Create transaction (payment)
 * @route   POST /api/v1/transactions
 * @access  Public (Telegram bot / Payment gateway)
 */
const createTransaction = asyncHandler(async (req, res, next) => {
  const { order, from, to, amount, type, paymentMethod, description } = req.body;

  // Validate order if provided
  if (order) {
    const orderExists = await Order.findById(order);
    if (!orderExists) {
      return next(new AppError('Order not found', 404));
    }
  }

  // Create transaction
  const transaction = await Transaction.create({
    order,
    from,
    fromModel: req.body.fromModel || 'User',
    to,
    toModel: req.body.toModel || 'Vendor',
    amount,
    type,
    paymentMethod,
    description,
    status: 'pending'
  });

  logger.info(`New transaction created: ${transaction.transactionId}`);

  // Populate transaction
  await transaction.populate([
    { path: 'order', select: 'orderNumber total' },
    { path: 'from' },
    { path: 'to' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Transaction created successfully',
    data: { transaction }
  });
});

/**
 * @desc    Update transaction status
 * @route   PUT /api/v1/transactions/:id/status
 * @access  Private (Admin or Payment gateway webhook)
 */
const updateTransactionStatus = asyncHandler(async (req, res, next) => {
  const { status } = req.body;

  const transaction = await Transaction.findById(req.params.id);

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  // Validate status
  const validStatuses = ['pending', 'completed', 'failed', 'refunded'];
  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  transaction.status = status;

  // Update balances on completion
  if (status === 'completed') {
    // Deduct from sender
    if (transaction.fromModel === 'User') {
      // User payments usually done upfront, no balance to deduct
    } else if (transaction.fromModel === 'Vendor') {
      const vendor = await Vendor.findById(transaction.from);
      if (vendor) {
        vendor.balance -= transaction.amount;
        await vendor.save();
      }
    } else if (transaction.fromModel === 'Driver') {
      const driver = await Driver.findById(transaction.from);
      if (driver) {
        driver.balance -= transaction.amount;
        await driver.save();
      }
    }

    // Add to receiver
    if (transaction.toModel === 'Vendor') {
      const vendor = await Vendor.findById(transaction.to);
      if (vendor) {
        vendor.balance += transaction.amount;
        await vendor.save();
      }
    } else if (transaction.toModel === 'Driver') {
      const driver = await Driver.findById(transaction.to);
      if (driver) {
        driver.balance += transaction.amount;
        await driver.save();
      }
    } else if (transaction.toModel === 'Platform') {
      // Platform revenue tracking (could be stored in a separate collection)
      logger.info(`Platform revenue: ${transaction.amount} from transaction ${transaction.transactionId}`);
    }
  }

  await transaction.save();

  logger.info(`Transaction status updated: ${transaction.transactionId} - ${status}`);

  res.status(200).json({
    success: true,
    message: 'Transaction status updated successfully',
    data: { transaction }
  });
});

/**
 * @desc    Get all transactions
 * @route   GET /api/v1/transactions
 * @access  Private/Admin
 */
const getAllTransactions = asyncHandler(async (req, res, next) => {
  const { type, status, paymentMethod, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (type) query.type = type;
  if (status) query.status = status;
  if (paymentMethod) query.paymentMethod = paymentMethod;

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Transaction.countDocuments(query);

  const transactions = await Transaction.find(query)
    .populate('order', 'orderNumber total')
    .populate('from')
    .populate('to')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: transactions.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { transactions }
  });
});

/**
 * @desc    Get transaction by ID
 * @route   GET /api/v1/transactions/:id
 * @access  Private/Admin or Owner
 */
const getTransactionById = asyncHandler(async (req, res, next) => {
  const transaction = await Transaction.findById(req.params.id)
    .populate('order', 'orderNumber total status')
    .populate('from')
    .populate('to');

  if (!transaction) {
    return next(new AppError('Transaction not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { transaction }
  });
});

/**
 * @desc    Get transactions by user
 * @route   GET /api/v1/transactions/user/:userId
 * @access  Public (Telegram bot)
 */
const getTransactionsByUser = asyncHandler(async (req, res, next) => {
  const { type, status } = req.query;

  const query = {
    $or: [
      { from: req.params.userId, fromModel: 'User' },
      { to: req.params.userId, toModel: 'User' }
    ]
  };

  if (type) query.type = type;
  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .populate('order', 'orderNumber total')
    .populate('from')
    .populate('to')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: transactions.length,
    data: { transactions }
  });
});

/**
 * @desc    Get transactions by vendor
 * @route   GET /api/v1/transactions/vendor/:vendorId
 * @access  Public (Telegram bot)
 */
const getTransactionsByVendor = asyncHandler(async (req, res, next) => {
  const { type, status } = req.query;

  const query = {
    $or: [
      { from: req.params.vendorId, fromModel: 'Vendor' },
      { to: req.params.vendorId, toModel: 'Vendor' }
    ]
  };

  if (type) query.type = type;
  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .populate('order', 'orderNumber total')
    .sort({ createdAt: -1 });

  // Calculate total earnings and payouts
  const earnings = await Transaction.aggregate([
    {
      $match: {
        to: new mongoose.Types.ObjectId(req.params.vendorId),
        toModel: 'Vendor',
        status: 'completed',
        type: 'payment'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  const payouts = await Transaction.aggregate([
    {
      $match: {
        from: new mongoose.Types.ObjectId(req.params.vendorId),
        fromModel: 'Vendor',
        status: 'completed',
        type: 'payout'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    earnings: earnings[0]?.total || 0,
    payouts: payouts[0]?.total || 0,
    data: { transactions }
  });
});

/**
 * @desc    Get transactions by driver
 * @route   GET /api/v1/transactions/driver/:driverId
 * @access  Public (Telegram bot)
 */
const getTransactionsByDriver = asyncHandler(async (req, res, next) => {
  const { type, status } = req.query;

  const query = {
    $or: [
      { from: req.params.driverId, fromModel: 'Driver' },
      { to: req.params.driverId, toModel: 'Driver' }
    ]
  };

  if (type) query.type = type;
  if (status) query.status = status;

  const transactions = await Transaction.find(query)
    .populate('order', 'orderNumber total')
    .sort({ createdAt: -1 });

  // Calculate total earnings
  const earnings = await Transaction.aggregate([
    {
      $match: {
        to: new mongoose.Types.ObjectId(req.params.driverId),
        toModel: 'Driver',
        status: 'completed',
        type: 'payment'
      }
    },
    { $group: { _id: null, total: { $sum: '$amount' } } }
  ]);

  res.status(200).json({
    success: true,
    count: transactions.length,
    earnings: earnings[0]?.total || 0,
    data: { transactions }
  });
});

/**
 * @desc    Request payout (Vendor/Driver)
 * @route   POST /api/v1/transactions/payout
 * @access  Public (Telegram bot)
 */
const requestPayout = asyncHandler(async (req, res, next) => {
  const { from, fromModel, amount, paymentMethod, description } = req.body;

  // Validate entity and balance
  let entity;
  if (fromModel === 'Vendor') {
    entity = await Vendor.findById(from);
  } else if (fromModel === 'Driver') {
    entity = await Driver.findById(from);
  } else {
    return next(new AppError('Invalid payout source', 400));
  }

  if (!entity) {
    return next(new AppError('Entity not found', 404));
  }

  if (entity.balance < amount) {
    return next(new AppError('Insufficient balance', 400));
  }

  // Create payout transaction
  const transaction = await Transaction.create({
    from,
    fromModel,
    to: 'Platform',
    toModel: 'Platform',
    amount,
    type: 'payout',
    paymentMethod,
    description: description || 'Payout request',
    status: 'pending'
  });

  logger.info(`Payout requested: ${transaction.transactionId} - ${fromModel} ${from}`);

  res.status(201).json({
    success: true,
    message: 'Payout request submitted successfully',
    data: { transaction }
  });
});

module.exports = {
  createTransaction,
  updateTransactionStatus,
  getAllTransactions,
  getTransactionById,
  getTransactionsByUser,
  getTransactionsByVendor,
  getTransactionsByDriver,
  requestPayout
};
