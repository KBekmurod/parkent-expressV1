/**
 * Admin routes — faqat super_admin va operator rollari uchun
 */
const express = require('express');
const router = express.Router();
const { protect, adminAuth, authorize } = require('../middleware/auth.middleware');
const { asyncHandler } = require('../middleware/error.middleware');
const { AppError } = require('../middleware/error.middleware');
const Admin = require('../models/Admin.model');
const User = require('../models/User.model');
const Vendor = require('../models/Vendor.model');
const Driver = require('../models/Driver.model');
const Order = require('../models/Order.model');
const logger = require('../utils/logger');

// Barcha admin route'lari himoyalangan
router.use(protect, adminAuth);

// ─── Adminlarni boshqarish (faqat super_admin) ──────────────────────────────

/**
 * GET /api/v1/admin/admins — barcha adminlar ro'yxati
 */
router.get('/admins', authorize('super_admin'), asyncHandler(async (req, res) => {
  const admins = await Admin.find().select('-password').sort({ createdAt: -1 });
  res.json({ success: true, count: admins.length, data: { admins } });
}));

/**
 * PUT /api/v1/admin/admins/:id/status — admin holatini o'zgartirish
 */
router.put('/admins/:id/status', authorize('super_admin'), asyncHandler(async (req, res, next) => {
  const { isActive } = req.body;
  if (typeof isActive !== 'boolean') {
    return next(new AppError('isActive (boolean) talab qilinadi', 400));
  }
  const admin = await Admin.findByIdAndUpdate(
    req.params.id,
    { isActive },
    { new: true }
  ).select('-password');

  if (!admin) return next(new AppError('Admin topilmadi', 404));
  logger.info(`Admin holati o'zgardi: ${admin.username} → ${isActive ? 'faol' : 'bloklangan'}`);
  res.json({ success: true, data: { admin } });
}));

// ─── Foydalanuvchilarni boshqarish ─────────────────────────────────────────

/**
 * GET /api/v1/admin/users — barcha foydalanuvchilar
 */
router.get('/users', asyncHandler(async (req, res) => {
  const { status, search, page = 1, limit = 20 } = req.query;
  const query = {};
  if (status) query.status = status;
  if (search) {
    query.$or = [
      { firstName: { $regex: search, $options: 'i' } },
      { phone: { $regex: search, $options: 'i' } }
    ];
  }
  const skip = (page - 1) * limit;
  const total = await User.countDocuments(query);
  const users = await User.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parseInt(limit));

  res.json({
    success: true, count: users.length, total,
    pages: Math.ceil(total / limit), currentPage: parseInt(page),
    data: { users }
  });
}));

/**
 * PUT /api/v1/admin/users/:id/status — foydalanuvchini bloklash/faollashtirish
 */
router.put('/users/:id/status', asyncHandler(async (req, res, next) => {
  const { status } = req.body;
  if (!['active', 'blocked'].includes(status)) {
    return next(new AppError('Noto\'g\'ri holat', 400));
  }
  const user = await User.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!user) return next(new AppError('Foydalanuvchi topilmadi', 404));
  logger.info(`Foydalanuvchi holati: ${user.firstName} → ${status}`);
  res.json({ success: true, data: { user } });
}));

// ─── Haydovchi tasdiqlash ───────────────────────────────────────────────────

/**
 * GET /api/v1/admin/drivers/pending — tasdiqlanmagan haydovchilar
 */
router.get('/drivers/pending', asyncHandler(async (req, res) => {
  const drivers = await Driver.find({ status: 'pending' }).sort({ createdAt: 1 });
  res.json({ success: true, count: drivers.length, data: { drivers } });
}));

/**
 * PUT /api/v1/admin/drivers/:id/approve — haydovchini tasdiqlash/rad etish
 */
router.put('/drivers/:id/approve', asyncHandler(async (req, res, next) => {
  const { approved, reason } = req.body;
  if (typeof approved !== 'boolean') {
    return next(new AppError('approved (boolean) talab qilinadi', 400));
  }

  const newStatus = approved ? 'active' : 'blocked';
  const driver = await Driver.findByIdAndUpdate(
    req.params.id,
    { status: newStatus },
    { new: true }
  );

  if (!driver) return next(new AppError('Haydovchi topilmadi', 404));

  logger.info(`Haydovchi ${approved ? 'tasdiqlandi' : 'rad etildi'}: ${driver.firstName}`);

  // Telegram bot orqali bildirishnoma yuborish (agar bot ishga tushgan bo'lsa)
  try {
    const { getDriverBot } = require('../bots/driver');
    const driverBot = getDriverBot();
    if (driverBot && driver.telegramId) {
      const { notifyApproval } = require('../bots/driver/handlers/start.handler');
      await notifyApproval(driverBot, driver.telegramId, approved, reason);
    }
  } catch (err) {
    logger.warn('Driver bot bildirishnomasi yuborilmadi:', err.message);
  }

  res.json({ success: true, message: approved ? 'Haydovchi tasdiqlandi' : 'Haydovchi rad etildi', data: { driver } });
}));

// ─── Vendor tasdiqlash ──────────────────────────────────────────────────────

/**
 * GET /api/v1/admin/vendors/pending — tasdiqlanmagan sotuvchilar
 */
router.get('/vendors/pending', asyncHandler(async (req, res) => {
  const vendors = await Vendor.find({ status: 'pending' }).sort({ createdAt: 1 });
  res.json({ success: true, count: vendors.length, data: { vendors } });
}));

/**
 * PUT /api/v1/admin/vendors/:id/approve — sotuvchini tasdiqlash/rad etish
 */
router.put('/vendors/:id/approve', asyncHandler(async (req, res, next) => {
  const { approved } = req.body;
  if (typeof approved !== 'boolean') {
    return next(new AppError('approved (boolean) talab qilinadi', 400));
  }

  const newStatus = approved ? 'active' : 'blocked';
  const vendor = await Vendor.findByIdAndUpdate(
    req.params.id,
    { status: newStatus },
    { new: true }
  );

  if (!vendor) return next(new AppError('Sotuvchi topilmadi', 404));
  logger.info(`Sotuvchi ${approved ? 'tasdiqlandi' : 'rad etildi'}: ${vendor.name}`);

  // Vendor'ga Telegram xabar yuborish
  try {
    const { getVendorBot } = require('../bots/vendor');
    const vendorBot = getVendorBot();
    if (vendorBot && vendor.telegramId) {
      const { notifyApproval } = require('../bots/vendor/handlers/start.handler');
      await notifyApproval(vendorBot, vendor.telegramId, approved, req.body.reason);
    }
  } catch (err) {
    logger.warn('Vendor bot bildirishnomasi yuborilmadi:', err.message);
  }

  res.json({ success: true, data: { vendor } });
}));

// ─── Dashboard statistika ───────────────────────────────────────────────────

/**
 * POST /api/v1/admin/test-notification — admin o'z Telegram ID'sini test qilish
 */
router.post('/test-notification', asyncHandler(async (req, res) => {
  const admin = await Admin.findById(req.user.id).select('telegramId firstName');

  if (!admin?.telegramId) {
    return res.status(400).json({
      success: false,
      message: "Telegram ID topilmadi. Avval Settings'da Telegram ID kiriting."
    });
  }

  const { notifyAdmins } = require('../services/notification.service');

  // Faqat shu adminga test xabar
  const Admin2 = require('../models/Admin.model');
  const tempAdmin = await Admin2.findById(req.user.id);
  if (tempAdmin) {
    // notifications.systemAlerts ni vaqtincha true qilib test yuborish
    const origSysAlerts = tempAdmin.notifications?.systemAlerts;
    if (!origSysAlerts) {
      tempAdmin.notifications = { ...tempAdmin.notifications?.toObject?.() || {}, systemAlerts: true };
      await tempAdmin.save();
    }
  }

  await notifyAdmins(
    `✅ *Test xabar!*\n\nSizning Telegram bildirishnomalaringiz to'g'ri sozlangan.\n\n🎉 Parkent Express Admin Panel`,
    'systemAlerts'
  );

  res.json({ success: true, message: 'Test xabar yuborildi' });
}));

/**
 * GET /api/v1/admin/dashboard — asosiy ko'rsatkichlar
 */
router.get('/dashboard', asyncHandler(async (req, res) => {
  const [
    totalUsers, totalVendors, totalDrivers, totalOrders,
    activeDrivers, pendingOrders, todayOrders
  ] = await Promise.all([
    User.countDocuments(),
    Vendor.countDocuments({ status: 'active' }),
    Driver.countDocuments({ status: 'active' }),
    Order.countDocuments(),
    Driver.countDocuments({ status: 'active', isOnline: true }),
    Order.countDocuments({ status: { $in: ['pending', 'accepted', 'preparing', 'ready', 'assigned'] } }),
    Order.countDocuments({
      createdAt: { $gte: new Date(new Date().setHours(0, 0, 0, 0)) }
    })
  ]);

  res.json({
    success: true,
    data: {
      users: totalUsers,
      vendors: totalVendors,
      drivers: totalDrivers,
      orders: totalOrders,
      activeDrivers,
      pendingOrders,
      todayOrders
    }
  });
}));

module.exports = router;
