const Driver = require('../models/Driver');
const Order = require('../models/Order');

// @desc    Register driver
// @route   POST /api/drivers
// @access  Private (Driver, Admin)
exports.registerDriver = async (req, res, next) => {
  try {
    req.body.user = req.user.id;

    // Check if driver already exists for this user
    const existingDriver = await Driver.findOne({ user: req.user.id });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        message: 'Driver profile already exists for this user'
      });
    }

    const driver = await Driver.create(req.body);

    res.status(201).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all drivers
// @route   GET /api/drivers
// @access  Private (Admin)
exports.getDrivers = async (req, res, next) => {
  try {
    const drivers = await Driver.find({ isActive: true })
      .populate('user', 'name email phone');

    res.status(200).json({
      success: true,
      count: drivers.length,
      data: drivers
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single driver
// @route   GET /api/drivers/:id
// @access  Private
exports.getDriver = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id)
      .populate('user', 'name email phone');

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver info
// @route   PUT /api/drivers/:id
// @access  Private (Driver, Admin)
exports.updateDriver = async (req, res, next) => {
  try {
    let driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Make sure user is driver owner or admin
    if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this driver profile'
      });
    }

    driver = await Driver.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update driver status
// @route   PATCH /api/drivers/:id/status
// @access  Private (Driver, Admin)
exports.updateDriverStatus = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Make sure user is driver owner or admin
    if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to update this driver status'
      });
    }

    const { status, currentLocation } = req.body;

    const updateData = {};
    if (status) updateData.status = status;
    if (currentLocation) updateData.currentLocation = currentLocation;

    const updatedDriver = await Driver.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );

    res.status(200).json({
      success: true,
      data: updatedDriver
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assigned orders for driver
// @route   GET /api/drivers/:id/orders
// @access  Private (Driver, Admin)
exports.getDriverOrders = async (req, res, next) => {
  try {
    const driver = await Driver.findById(req.params.id);

    if (!driver) {
      return res.status(404).json({
        success: false,
        message: 'Driver not found'
      });
    }

    // Make sure user is driver owner or admin
    if (driver.user.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to view these orders'
      });
    }

    const orders = await Order.find({ driver: req.params.id })
      .populate('customer', 'name phone')
      .populate('vendor', 'restaurantName phone address')
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
