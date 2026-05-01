const Order = require('../models/Order.model');
const Product = require('../models/Product.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const logger = require('../utils/logger');
const { PLATFORM_CONFIG, ORDER_STATUS } = require('../config/constants');
const { autoAssignDriver, calcDeliveryFee, haversineKm } = require('../services/autoAssign.service');
const { notifyCustomer, notifyVendorNewOrder, notifyDriverNewAssignment } = require('../services/notification.service');

/**
 * Generate unique order number
 */
const generateOrderNumber = async () => {
  const date = new Date();
  const prefix = `ORD${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}${String(date.getDate()).padStart(2, '0')}`;
  
  // Find the last order number for today
  const lastOrder = await Order.findOne({ 
    orderNumber: { $regex: `^${prefix}` } 
  }).sort({ orderNumber: -1 }).select('orderNumber');
  
  let sequence = 1;
  if (lastOrder) {
    const lastSequence = parseInt(lastOrder.orderNumber.slice(-4));
    sequence = lastSequence + 1;
  }
  
  return `${prefix}${String(sequence).padStart(4, '0')}`;
};

/**
 * Create order with retry logic for order number generation
 */
const createOrderWithRetry = async (orderData, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const orderNumber = await generateOrderNumber();
      orderData.orderNumber = orderNumber;
      return await Order.create(orderData);
    } catch (error) {
      // If duplicate key error on orderNumber, retry
      if (error.code === 11000 && error.keyPattern?.orderNumber && attempt < maxRetries) {
        logger.warn(`Order number collision, retrying... (attempt ${attempt}/${maxRetries})`);
        continue;
      }
      throw error;
    }
  }
  throw new Error('Failed to generate unique order number after multiple attempts');
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
    return next(new AppError('Restoran hozir buyurtma qabul qilmaydi', 400));
  }

  // Restoran ish vaqtini tekshirish (Toshkent vaqti, UTC+5)
  if (vendorExists.workingHours?.start && vendorExists.workingHours?.end) {
    const now = new Date();
    // Toshkent vaqti: UTC + 5 soat
    const tashkentMinutes = (now.getUTCHours() * 60 + now.getUTCMinutes() + 5 * 60) % (24 * 60);
    const [startH, startM] = vendorExists.workingHours.start.split(':').map(Number);
    const [endH, endM] = vendorExists.workingHours.end.split(':').map(Number);
    const startMin = startH * 60 + startM;
    const endMin = endH * 60 + endM;

    let isWorking;
    if (startMin <= endMin) {
      // Oddiy: masalan 09:00 - 22:00
      isWorking = tashkentMinutes >= startMin && tashkentMinutes <= endMin;
    } else {
      // Tunni o'tib ketadigan: masalan 18:00 - 02:00
      isWorking = tashkentMinutes >= startMin || tashkentMinutes <= endMin;
    }

    if (!isWorking) {
      return next(new AppError(
        `Restoran ish vaqti: ${vendorExists.workingHours.start} - ${vendorExists.workingHours.end}. Hozir yopiq.`,
        400
      ));
    }
  }

  // Validate products and calculate total
  let subtotal = 0;
  const orderItems = [];

  for (const item of items) {
    const product = await Product.findById(item.product);
    
    if (!product) {
      return next(new AppError(`Mahsulot ${item.product} topilmadi`, 404));
    }

    if (!product.isAvailable) {
      return next(new AppError(`"${product.name?.uz || product.name}" mahsuloti hozir mavjud emas`, 400));
    }

    // Mahsulot ushbu restoranga tegishli ekanligini tekshirish
    if (product.vendor.toString() !== vendor.toString()) {
      return next(new AppError(
        `"${product.name?.uz || product.name}" mahsuloti boshqa restoranga tegishli`,
        400
      ));
    }

    const itemPrice = product.getDiscountedPrice();

    orderItems.push({
      product: product._id,
      quantity: item.quantity,
      price: itemPrice
    });

    subtotal += itemPrice * item.quantity;
  }

  // Minimal buyurtma summasini tekshirish
  if (subtotal < PLATFORM_CONFIG.MIN_ORDER_AMOUNT) {
    return next(new AppError(
      `Minimal buyurtma summasi ${PLATFORM_CONFIG.MIN_ORDER_AMOUNT.toLocaleString()} so'm. Sizning buyurtmangiz: ${subtotal.toLocaleString()} so'm`,
      400
    ));
  }

  // Yetkazib berish narxini dinamik hisoblash
  let deliveryFee = PLATFORM_CONFIG.DEFAULT_DELIVERY_FEE;

  if (
    deliveryAddress?.location?.lat &&
    deliveryAddress?.location?.lng &&
    vendorExists.location?.lat &&
    vendorExists.location?.lng
  ) {
    const distKm = haversineKm(
      vendorExists.location.lat,
      vendorExists.location.lng,
      deliveryAddress.location.lat,
      deliveryAddress.location.lng
    );
    deliveryFee = calcDeliveryFee(distKm);
  }

  // Jami narx
  const total = subtotal + deliveryFee;

  // Create order with retry logic to handle order number collisions
  const order = await createOrderWithRetry({
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
    { path: 'customer', select: 'firstName lastName phone telegramId authType' },
    { path: 'vendor', select: 'name phone address location telegramId' },
    { path: 'items.product', select: 'name photo price' }
  ]);

  // Vendor'ga Telegram orqali yangi buyurtma haqida xabar yuborish (background)
  notifyVendorNewOrder(order).catch(err => logger.warn('Vendor notify error:', err.message));

  // Mijozga buyurtma qabul qilingani haqida xabar (background)
  notifyCustomer(order, 'pending').catch(err => logger.warn('Customer notify error:', err.message));

  // Socket.io orqali real-time bildirishnoma
  const io = req.app.get('io');
  if (io) {
    io.to(`vendor:${vendor}`).emit('order:new', { order });
    io.to(`customer:${customer}`).emit('order:created', { order });
  }

  res.status(201).json({
    success: true,
    message: 'Buyurtma muvaffaqiyatli yaratildi',
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
    return next(new AppError('Buyurtma topilmadi', 404));
  }

  const validStatuses = [
    'pending', 'accepted', 'preparing', 'ready',
    'assigned', 'picked_up', 'on_the_way',
    'delivered', 'cancelled', 'rejected'
  ];

  if (!validStatuses.includes(status)) {
    return next(new AppError('Noto\'g\'ri holat', 400));
  }

  // Status o'tishi qoidalarini tekshirish
  const VALID_TRANSITIONS = {
    pending:    ['accepted', 'rejected', 'cancelled'],
    accepted:   ['preparing', 'cancelled'],
    preparing:  ['ready', 'cancelled'],
    ready:      ['assigned', 'picked_up', 'cancelled'],
    assigned:   ['picked_up', 'cancelled'],
    picked_up:  ['on_the_way'],
    on_the_way: ['delivered'],
    delivered:  [],
    cancelled:  [],
    rejected:   []
  };

  if (!VALID_TRANSITIONS[order.status]?.includes(status)) {
    return next(new AppError(
      `"${order.status}" holatidan "${status}" holatiga o'tib bo'lmaydi`,
      400
    ));
  }

  order.status = status;
  await order.save();

  // Buyurtma "ready" bo'lganda avtomatik haydovchi biriktirish
  if (status === ORDER_STATUS.READY) {
    const io = req.app.get('io');
    await order.populate('vendor', 'location name');
    const assignedDriver = await autoAssignDriver(order, io);
    if (assignedDriver) {
      logger.info(`Auto-assign: ${assignedDriver.firstName} → order ${order._id}`);
    } else {
      logger.warn(`Auto-assign: ${order._id} uchun bo'sh haydovchi topilmadi`);
    }
  }

  // Yetkazilganda statistikani yangilash
  if (status === ORDER_STATUS.DELIVERED) {
    await Vendor.findByIdAndUpdate(order.vendor, { $inc: { totalOrders: 1 } });

    if (order.driver) {
      await Driver.findByIdAndUpdate(order.driver, {
        $inc: { totalDeliveries: 1 },
        $pull: { currentOrders: order._id }
      });
    }
  }

  // Rad etilganda yoki bekor qilinganda — haydovchidan ham o'chirish
  if ([ORDER_STATUS.REJECTED, ORDER_STATUS.CANCELLED].includes(status)) {
    if (order.driver) {
      await Driver.findByIdAndUpdate(order.driver, {
        $pull: { currentOrders: order._id }
      });
    }
  }

  logger.info(`Order status: ${order._id} → ${status}`);

  await order.populate([
    { path: 'customer', select: 'firstName lastName phone telegramId authType' },
    { path: 'vendor', select: 'name phone' },
    { path: 'driver', select: 'firstName lastName phone vehicle' }
  ]);

  // Mijozga Telegram orqali bildirishnoma (background, fail qilsa ham order o'zgaradi)
  notifyCustomer(order, status).catch(err =>
    logger.warn('notifyCustomer error:', err.message)
  );

  // Socket.io orqali barcha tomonlarga real-time bildirishnoma
  const broadcast = require('../socket/utils/broadcast');
  broadcast.broadcastOrderStatus(order._id.toString(), status, order);

  res.status(200).json({
    success: true,
    message: 'Buyurtma holati yangilandi',
    data: { order }
  });
});

/**
 * @desc    Buyurtmaga haydovchi biriktirish (admin qo'lda)
 * @route   PUT /api/v1/orders/:id/assign-driver
 * @access  Private (Admin)
 */
const assignDriver = asyncHandler(async (req, res, next) => {
  const { driverId } = req.body;
  const { tryAssignDriverAtomic } = require('../services/autoAssign.service');

  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(new AppError('Buyurtma topilmadi', 404));
  }

  if (order.status !== ORDER_STATUS.READY) {
    return next(new AppError('Buyurtma "ready" holatida bo\'lishi kerak', 400));
  }

  if (order.driver) {
    return next(new AppError('Buyurtmaga allaqachon haydovchi biriktirilgan', 400));
  }

  // Atomic tarzda haydovchini biriktirish (race-safe)
  const success = await tryAssignDriverAtomic(driverId, order._id);

  if (!success) {
    return next(new AppError(
      'Haydovchi mavjud emas yoki maksimal buyurtmalar soniga yetdi',
      400
    ));
  }

  // Buyurtma holatini yangilash
  order.driver = driverId;
  order.status = ORDER_STATUS.ASSIGNED;
  await order.save();

  logger.info(`Admin haydovchini biriktirdi: order ${order._id} → driver ${driverId}`);

  // Socket.io orqali bildirishnoma
  const io = req.app.get('io');
  if (io) {
    io.to(`driver:${driverId}`).emit('order:new_assignment', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      message: 'Sizga yangi buyurtma biriktirildi!'
    });
  }

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

  // Haydovchining joriy buyurtmalar ro'yxatidan atomic o'chirish
  if (order.driver) {
    await Driver.findByIdAndUpdate(order.driver, {
      $pull: { currentOrders: order._id }
    });
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
