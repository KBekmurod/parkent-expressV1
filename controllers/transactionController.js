const Transaction = require('../models/Transaction');
const Order = require('../models/Order');

// @desc    Create transaction
// @route   POST /api/transactions
// @access  Private (Admin, System)
exports.createTransaction = async (req, res, next) => {
  try {
    const { order: orderId, type, paymentMethod, paymentGateway, gatewayTransactionId, description } = req.body;

    // Check if order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const transaction = await Transaction.create({
      order: orderId,
      customer: order.customer,
      vendor: order.vendor,
      driver: order.driver,
      amount: order.total,
      type,
      paymentMethod,
      paymentGateway,
      gatewayTransactionId,
      description
    });

    // Update order payment status
    if (type === 'payment' && transaction.status === 'completed') {
      order.paymentStatus = 'completed';
      await order.save();
    }

    res.status(201).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all transactions
// @route   GET /api/transactions
// @access  Private (Role-based)
exports.getTransactions = async (req, res, next) => {
  try {
    let query;

    // Role-based filtering
    if (req.user.role === 'customer') {
      query = { customer: req.user.id };
    } else if (req.user.role === 'vendor') {
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findOne({ user: req.user.id });
      if (!vendor) {
        return res.status(404).json({
          success: false,
          message: 'Vendor profile not found'
        });
      }
      query = { vendor: vendor._id };
    } else if (req.user.role === 'driver') {
      const Driver = require('../models/Driver');
      const driver = await Driver.findOne({ user: req.user.id });
      if (!driver) {
        return res.status(404).json({
          success: false,
          message: 'Driver profile not found'
        });
      }
      query = { driver: driver._id };
    } else {
      // Admin can see all transactions
      query = {};
    }

    const transactions = await Transaction.find(query)
      .populate('customer', 'name email')
      .populate('vendor', 'restaurantName')
      .populate('driver', 'user vehicleType')
      .populate('order', 'status total')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single transaction
// @route   GET /api/transactions/:id
// @access  Private
exports.getTransaction = async (req, res, next) => {
  try {
    const transaction = await Transaction.findById(req.params.id)
      .populate('customer', 'name email phone')
      .populate('vendor', 'restaurantName phone')
      .populate('driver', 'user vehicleType vehicleNumber')
      .populate('order');

    if (!transaction) {
      return res.status(404).json({
        success: false,
        message: 'Transaction not found'
      });
    }

    // Check authorization
    const isCustomer = transaction.customer._id.toString() === req.user.id;
    const isAdmin = req.user.role === 'admin';
    
    // Check if vendor
    let isVendor = false;
    if (req.user.role === 'vendor') {
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findOne({ user: req.user.id });
      isVendor = vendor && transaction.vendor._id.toString() === vendor._id.toString();
    }

    // Check if driver
    let isDriver = false;
    if (req.user.role === 'driver') {
      const Driver = require('../models/Driver');
      const driver = await Driver.findOne({ user: req.user.id });
      isDriver = driver && transaction.driver && transaction.driver._id.toString() === driver._id.toString();
    }

    if (!isCustomer && !isVendor && !isDriver && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this transaction'
      });
    }

    res.status(200).json({
      success: true,
      data: transaction
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get transactions by order
// @route   GET /api/transactions/order/:orderId
// @access  Private
exports.getTransactionsByOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.orderId);
    
    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const transactions = await Transaction.find({ order: req.params.orderId })
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: transactions.length,
      data: transactions
    });
  } catch (error) {
    next(error);
  }
};
