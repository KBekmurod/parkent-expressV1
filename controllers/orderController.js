const Order = require('../models/Order');
const Product = require('../models/Product');
const Vendor = require('../models/Vendor');

// @desc    Create new order
// @route   POST /api/orders
// @access  Private (Customer)
exports.createOrder = async (req, res, next) => {
  try {
    const { vendor, items, deliveryAddress, paymentMethod, specialInstructions } = req.body;

    // Verify vendor exists
    const vendorDoc = await Vendor.findById(vendor);
    if (!vendorDoc) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    // Calculate order totals
    let subtotal = 0;
    const orderItems = [];

    for (const item of items) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: `Product ${item.product} not found`
        });
      }

      if (!product.isAvailable) {
        return res.status(400).json({
          success: false,
          message: `Product ${product.name} is not available`
        });
      }

      const itemTotal = product.price * item.quantity;
      subtotal += itemTotal;

      orderItems.push({
        product: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
        specialInstructions: item.specialInstructions
      });
    }

    const deliveryFee = vendorDoc.deliveryFee || 0;
    const tax = subtotal * 0.1; // 10% tax
    const total = subtotal + deliveryFee + tax;

    // Create order
    const order = await Order.create({
      customer: req.user.id,
      vendor,
      items: orderItems,
      deliveryAddress,
      subtotal,
      deliveryFee,
      tax,
      total,
      paymentMethod,
      specialInstructions
    });

    // Populate order details
    await order.populate('customer', 'name phone');
    await order.populate('vendor', 'restaurantName phone address');

    res.status(201).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private
exports.getOrders = async (req, res, next) => {
  try {
    let query;

    // Role-based filtering
    if (req.user.role === 'customer') {
      query = { customer: req.user.id };
    } else if (req.user.role === 'vendor') {
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
      // Admin can see all orders
      query = {};
    }

    const orders = await Order.find(query)
      .populate('customer', 'name phone')
      .populate('vendor', 'restaurantName phone address')
      .populate('driver', 'user vehicleType vehicleNumber')
      .sort('-createdAt');

    res.status(200).json({
      success: true,
      count: orders.length,
      data: orders
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('customer', 'name phone address')
      .populate('vendor', 'restaurantName phone address')
      .populate('driver', 'user vehicleType vehicleNumber currentLocation')
      .populate('items.product');

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check authorization
    const isCustomer = order.customer._id.toString() === req.user.id;
    
    // For vendor authorization, we need to check the vendor's user field
    let isVendor = false;
    if (req.user.role === 'vendor') {
      const Vendor = require('../models/Vendor');
      const vendor = await Vendor.findById(order.vendor._id);
      isVendor = vendor && vendor.user.toString() === req.user.id;
    }
    
    // For driver authorization, we need to check the driver's user field
    let isDriver = false;
    if (order.driver && req.user.role === 'driver') {
      const Driver = require('../models/Driver');
      const driver = await Driver.findById(order.driver._id);
      isDriver = driver && driver.user.toString() === req.user.id;
    }
    
    const isAdmin = req.user.role === 'admin';

    if (!isCustomer && !isVendor && !isDriver && !isAdmin) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view this order'
      });
    }

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order
// @route   PUT /api/orders/:id
// @access  Private (Vendor, Admin)
exports.updateOrder = async (req, res, next) => {
  try {
    let order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only vendor or admin can update orders
    const vendor = await Vendor.findById(order.vendor);
    if (vendor.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this order'
      });
    }

    order = await Order.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update order status
// @route   PATCH /api/orders/:id/status
// @access  Private (Vendor, Driver, Admin)
exports.updateOrderStatus = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    const { status } = req.body;

    if (!status) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a status'
      });
    }

    // Update order status
    order.status = status;

    // If delivered, set actual delivery time
    if (status === 'delivered') {
      order.actualDeliveryTime = Date.now();
      order.paymentStatus = 'completed';
    }

    await order.save();

    res.status(200).json({
      success: true,
      data: order
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Cancel order
// @route   DELETE /api/orders/:id
// @access  Private (Customer, Admin)
exports.cancelOrder = async (req, res, next) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Only customer or admin can cancel
    if (order.customer.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to cancel this order'
      });
    }

    // Cannot cancel if already delivered or in certain statuses
    if (['delivered', 'cancelled'].includes(order.status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel order with status: ${order.status}`
      });
    }

    order.status = 'cancelled';
    order.cancelledBy = req.user.id;
    order.cancelReason = req.body.reason || 'Cancelled by customer';

    await order.save();

    res.status(200).json({
      success: true,
      data: order,
      message: 'Order cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};
