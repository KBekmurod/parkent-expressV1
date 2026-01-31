const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { PLATFORM_CONFIG, ORDER_STATUS } = require('../config/constants');

/**
 * Generate unique order number
 */
const generateOrderNumber = async () => {
  const date = new Date();
  const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  // Find the last order number for today
  const lastOrder = await Order.findOne({ 
    orderNumber: { $regex: `^${prefix}` } 
  }).sort({ orderNumber: -1 });
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

/**
 * @desc    Create order
 * @route   POST /api/v1/orders
 * @access  Public (Telegram bot)
 */
const createOrder = asyncHandler(async (req, res, next) => {
  const { customer, vendor, items, deliveryAddress, paymentMethod, customerNote } = req.body;

  // Validate customer
  const customerExists = await User.findById(customer);
  if (!customerExists) {
    return next(new AppError('Customer not found', 404));
  }

  // Validate vendor
  const vendorExists = await Vendor.findById(vendor);
  if (!vendorExists) {
    return next(new AppError('Vendor not found', 404));
  }

  if (vendorExists.status !== 'active' || !vendorExists.isOpen) {
    return next(new AppError('Vendor is not available', 400));
  }

  // Validate products and calculate total
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Product ${item.product} not found`, 404));
    }

    if (!product.isAvailable) {
      return next(new AppError(`Product ${product.name.uz} is not available`, 400));
    }

    const itemPrice = product.getDiscountedPrice();

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: itemPrice
    });

    subtotal += itemPrice * item.quantity;
  }

  // Calculate delivery fee (simple flat rate for now)
  const deliveryFee = PLATFORM_CONFIG.DEFAULT_DELIVERY_FEE;

  // Calculate total
  const total = subtotal + deliveryFee;

  // Generate order number
  const orderNumber = await generateOrderNumber();

  // Create order
  const order = await Order.create({
    orderNumber,
    customer,
    vendor,
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    deliveryAddress,
    paymentMethod,
    customerNote,
    status: 'pending'
  });

  // Update customer total orders
  customerExists.totalOrders += 1;
  await customerExists.save();

  logger.info(`New order created: ${order._id} by customer ${customer}`);

  // Populate order
  await order.populate([
    { path: 'customer', select: 'firstName lastName phone' },
    { path: 'vendor', select: 'name phone address location' },
    { path: 'items.product', select: 'name photo price' }
  ]);

  res.status(201).json({
    success: true,
    message: 'Order created successfully',
    data: { order }
  });
});

/**
 * @desc    Get all orders
 * @route   GET /api/v1/orders
 * @access  Private/Admin
 */
const getAllOrders = asyncHandler(async (req, res, next) => {
  const { status, vendor, driver, customer, page = 1, limit = 20 } = req.query;

  // Build query
  const query = {};
  if (status) query.status = status;
  if (vendor) query.vendor = vendor;
  if (driver) query.driver = driver;
  if (customer) query.customer = customer;

  // Pagination
  const skip = (page - 1) * limit;
  const total = await Order.countDocuments(query);

  const orders = await Order.find(query)
    .populate('customer', 'firstName lastName phone')
    .populate('vendor', 'name phone')
    .populate('driver', 'firstName lastName phone vehicle')
    .populate('items.product', 'name photo')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.status(200).json({
    success: true,
    count: orders.length,
    total,
    pages: Math.ceil(total / limit),
    currentPage: parseInt(page),
    data: { orders }
  });
});

/**
 * @desc    Get order by ID
 * @route   GET /api/v1/orders/:id
 * @access  Public (Customer/Vendor/Driver/Admin)
 */
const getOrderById = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'firstName lastName phone')
    .populate('vendor', 'name phone address location')
    .populate('driver', 'firstName lastName phone vehicle currentLocation')
    .populate('items.product', 'name photo price');

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  res.status(200).json({
    success: true,
    data: { order }
  });
});

/**
 * @desc    Get orders by customer
 * @route   GET /api/v1/orders/customer/:customerId
 * @access  Public (Telegram bot)
 */
const getOrdersByCustomer = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = { customer: req.params.customerId };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('vendor', 'name logo')
    .populate('driver', 'firstName lastName phone vehicle')
    .populate('items.product', 'name photo')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: { orders }
  });
});

/**
 * @desc    Get orders by vendor
 * @route   GET /api/v1/orders/vendor/:vendorId
 * @access  Public (Telegram bot)
 */
const getOrdersByVendor = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = { vendor: req.params.vendorId };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('customer', 'firstName lastName phone')
    .populate('driver', 'firstName lastName phone vehicle')
    .populate('items.product', 'name photo')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: { orders }
  });
});

/**
 * @desc    Get orders by driver
 * @route   GET /api/v1/orders/driver/:driverId
 * @access  Public (Telegram bot)
 */
const getOrdersByDriver = asyncHandler(async (req, res, next) => {
  const { status } = req.query;

  const query = { driver: req.params.driverId };
  if (status) query.status = status;

  const orders = await Order.find(query)
    .populate('customer', 'firstName lastName phone')
    .populate('vendor', 'name phone address location')
    .populate('items.product', 'name photo')
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    count: orders.length,
    data: { orders }
  });
});

/**
 * @desc    Update order status
 * @route   PUT /api/v1/orders/:id/status
 * @access  Private (Vendor/Driver/Admin)
 */
const updateOrderStatus = asyncHandler(async (req, res, next) => {
  const { status, note } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Validate status transition
  const validStatuses = [
    'pending', 'accepted', 'preparing', 'ready',
    'assigned', 'picked_up', 'on_the_way',
    'delivered', 'cancelled', 'rejected'
  ];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Invalid status', 400));
  }

  order.status = status;

  // Timeline is automatically updated by pre-save hook

  await order.save();

  // Update vendor total orders on delivery
  if (status === ORDER_STATUS.DELIVERED) {
    const vendor = await Vendor.findById(order.vendor);
    vendor.totalOrders += 1;
    await vendor.save();

    // Update driver stats
    if (order.driver) {
      const driver = await Driver.findById(order.driver);
      driver.totalDeliveries += 1;
      // Remove from current orders
      driver.currentOrders = driver.currentOrders.filter(
        orderId => orderId.toString() !== order._id.toString()
      );
      await driver.save();
    }
  }

  logger.info(`Order status updated: ${order._id} - ${status}`);

  await order.populate([
    { path: 'customer', select: 'firstName lastName phone' },
    { path: 'vendor', select: 'name phone' },
    { path: 'driver', select: 'firstName lastName phone vehicle' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Order status updated successfully',
    data: { order }
  });
});

/**
 * @desc    Assign driver to order
 * @route   PUT /api/v1/orders/:id/assign-driver
 * @access  Private (Admin or Auto-assign system)
 */
const assignDriver = asyncHandler(async (req, res, next) => {
  const { driverId } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  if (order.status !== ORDER_STATUS.READY) {
    return next(new AppError('Order must be in ready status to assign driver', 400));
  }

  // Validate driver
  const driver = await Driver.findById(driverId);

  if (!driver) {
    return next(new AppError('Driver not found', 404));
  }

  if (driver.status !== 'active' || !driver.isOnline) {
    return next(new AppError('Driver is not available', 400));
  }

  if (driver.currentOrders.length >= PLATFORM_CONFIG.MAX_DRIVER_ORDERS) {
    return next(new AppError('Driver has maximum orders', 400));
  }

  // Assign driver
  order.driver = driverId;
  order.status = ORDER_STATUS.ASSIGNED;
  await order.save();

  // Add to driver's current orders
  driver.currentOrders.push(order._id);
  await driver.save();

  logger.info(`Driver assigned to order: ${order._id} - Driver: ${driverId}`);

  await order.populate([
    { path: 'driver', select: 'firstName lastName phone vehicle currentLocation' }
  ]);

  res.status(200).json({
    success: true,
    message: 'Driver assigned successfully',
    data: { order }
  });
});

/**
 * @desc    Cancel order
 * @route   PUT /api/v1/orders/:id/cancel
 * @access  Public (Customer/Vendor/Admin)
 */
const cancelOrder = asyncHandler(async (req, res, next) => {
  const { reason } = req.body;

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Order not found', 404));
  }

  // Can only cancel if not delivered
  if ([ORDER_STATUS.DELIVERED, ORDER_STATUS.CANCELLED].includes(order.status)) {
    return next(new AppError('Cannot cancel this order', 400));
  }

  order.status = ORDER_STATUS.CANCELLED;
  await order.save();

  // Remove from driver's current orders if assigned
  if (order.driver) {
    const driver = await Driver.findById(order.driver);
    driver.currentOrders = driver.currentOrders.filter(
      orderId => orderId.toString() !== order._id.toString()
    );
    await driver.save();
  }

  logger.info(`Order cancelled: ${order._id} - Reason: ${reason}`);

  res.status(200).json({
    success: true,
    message: 'Order cancelled successfully',
    data: { order }
  });
});

module.exports = {
  createOrder,
  getAllOrders,
  getOrderById,
  getOrdersByCustomer,
  getOrdersByVendor,
  getOrdersByDriver,
  updateOrderStatus,
  assignDriver,
  cancelOrder
};
