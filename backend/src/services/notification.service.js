/**
 * Notification service
 * Barcha Telegram bildirishnomalar shu yerdan boshqariladi.
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const STATUS_MESSAGES_UZ = {
  pending:    '⏳ Buyurtmangiz qabul qilindi va tekshirilmoqda',
  accepted:   '✅ Restoran buyurtmangizni qabul qildi',
  preparing:  '👨‍🍳 Buyurtmangiz tayyorlanmoqda',
  ready:      '🍽️ Buyurtma tayyor, kuryer qidirilmoqda',
  assigned:   '🚴 Kuryer biriktirildi va yo\'lda',
  picked_up:  '📦 Kuryer buyurtmangizni oldi',
  on_the_way: '🛵 Kuryer sizga yo\'l olmoqda',
  delivered:  '🎉 Buyurtmangiz yetkazib berildi! Yoqimli ishtaha!',
  cancelled:  '❌ Buyurtmangiz bekor qilindi',
  rejected:   '❌ Restoran buyurtmangizni rad etdi'
};

// ─── Yordamchi: istalgan botni olish ─────────────────────────────────────────
const getAnyBot = () => {
  const attempts = [
    () => require('../bots/customer').getCustomerBot(),
    () => require('../bots/vendor').getVendorBot(),
    () => require('../bots/driver').getDriverBot(),
  ];
  for (const attempt of attempts) {
    try {
      const bot = attempt();
      if (bot) return bot;
    } catch { /* keyingisini sinash */ }
  }
  return null;
};

// ─── Adminlarga xabar ────────────────────────────────────────────────────────
/**
 * Barcha faol adminlarga Telegram xabar yuborish
 * @param {string} message
 * @param {string} notificationType - newVendor | newDriver | newOrder | systemAlerts
 */
const notifyAdmins = async (message, notificationType = 'systemAlerts') => {
  try {
    const Admin = require('../models/Admin.model');
    const filter = {
      isActive: true,
      telegramId: { $ne: null, $exists: true, $ne: '' }
    };
    if (notificationType) {
      filter[`notifications.${notificationType}`] = true;
    }

    const admins = await Admin.find(filter).select('telegramId firstName');
    if (admins.length === 0) {
      logger.info('notifyAdmins: Telegram ID qo\'ygan admin topilmadi');
      return;
    }

    const bot = getAnyBot();
    if (!bot) {
      logger.warn('notifyAdmins: Bot topilmadi');
      return;
    }

    for (const admin of admins) {
      try {
        await bot.sendMessage(admin.telegramId, message, { parse_mode: 'Markdown' });
      } catch (err) {
        logger.warn(`Admin ${admin.firstName} ga xabar yuborilmadi: ${err.message}`);
      }
    }
  } catch (err) {
    logger.error('notifyAdmins xatosi:', err);
  }
};

/**
 * Yangi vendor ro'yxatdan o'tganda adminlarga xabar
 */
const notifyAdminNewVendor = async (vendor) => {
  const message =
    `🏪 *Yangi restoran ariza berdi!*\n\n` +
    `📛 Nomi: ${vendor.name}\n` +
    `📂 Kategoriya: ${vendor.category || 'Ko\'rsatilmagan'}\n` +
    `📱 Telefon: ${vendor.phone}\n` +
    `📍 Manzil: ${vendor.address || 'Ko\'rsatilmagan'}\n\n` +
    `✅ Tasdiqlash uchun:\nAdmin Panel → Vendors → Status: Pending`;
  await notifyAdmins(message, 'newVendor');
};

/**
 * Yangi driver ro'yxatdan o'tganda adminlarga xabar
 */
const notifyAdminNewDriver = async (driver) => {
  const message =
    `🚴 *Yangi kuryer ariza berdi!*\n\n` +
    `👤 Ism: ${driver.firstName} ${driver.lastName || ''}\n` +
    `📱 Telefon: ${driver.phone}\n` +
    `🚗 Transport: ${driver.vehicle || ''} ${driver.vehicleModel || ''}\n` +
    `🔢 Davlat raqami: ${driver.plateNumber || 'Ko\'rsatilmagan'}\n\n` +
    `✅ Tasdiqlash uchun:\nAdmin Panel → Drivers → Status: Pending`;
  await notifyAdmins(message, 'newDriver');
};

// ─── Mijozga xabar ────────────────────────────────────────────────────────────
const notifyCustomer = async (order, status) => {
  try {
    if (!order.customer) return;
    let user = order.customer;
    if (typeof user === 'string' || user instanceof mongoose.Types.ObjectId) {
      const User = require('../models/User.model');
      user = await User.findById(user).select('telegramId authType');
    }
    if (!user || user.authType === 'web' || !user.telegramId) return;

    const message = STATUS_MESSAGES_UZ[status] || `Buyurtma holati: ${status}`;
    const fullMessage = `📦 Buyurtma #${order.orderNumber}\n\n${message}`;

    try {
      const { getCustomerBot } = require('../bots/customer');
      const bot = getCustomerBot();
      if (bot) await bot.sendMessage(user.telegramId, fullMessage);
    } catch (err) {
      logger.warn(`Customer notify: ${err.message}`);
    }
  } catch (err) {
    logger.error('notifyCustomer xatosi:', err);
  }
};

// ─── Vendorga yangi buyurtma xabari ──────────────────────────────────────────
const notifyVendorNewOrder = async (order) => {
  try {
    if (!order.vendor) return;
    let vendor = order.vendor;
    if (typeof vendor === 'string' || vendor instanceof mongoose.Types.ObjectId) {
      const Vendor = require('../models/Vendor.model');
      vendor = await Vendor.findById(vendor).select('telegramId name');
    }
    if (!vendor || !vendor.telegramId) return;

    const message =
      `🔔 *Yangi buyurtma!*\n\n` +
      `📦 #${order.orderNumber}\n` +
      `💰 ${order.total?.toLocaleString()} so'm\n\n` +
      `Botda ko'rish uchun /start bosing.`;

    try {
      const { getVendorBot } = require('../bots/vendor');
      const bot = getVendorBot();
      if (bot) await bot.sendMessage(vendor.telegramId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      logger.warn(`Vendor notify: ${err.message}`);
    }
  } catch (err) {
    logger.error('notifyVendorNewOrder xatosi:', err);
  }
};

// ─── Haydovchiga yangi buyurtma xabari ───────────────────────────────────────
const notifyDriverNewAssignment = async (order, driverId) => {
  try {
    const Driver = require('../models/Driver.model');
    const driver = await Driver.findById(driverId).select('telegramId firstName');
    if (!driver || !driver.telegramId) return;

    const message =
      `🔔 *Sizga yangi buyurtma!*\n\n` +
      `📦 #${order.orderNumber}\n` +
      `💰 ${order.total?.toLocaleString()} so'm\n\n` +
      `Botda ko'rish uchun /start bosing.`;

    try {
      const { getDriverBot } = require('../bots/driver');
      const bot = getDriverBot();
      if (bot) await bot.sendMessage(driver.telegramId, message, { parse_mode: 'Markdown' });
    } catch (err) {
      logger.warn(`Driver notify: ${err.message}`);
    }
  } catch (err) {
    logger.error('notifyDriverNewAssignment xatosi:', err);
  }
};

module.exports = {
  notifyCustomer,
  notifyVendorNewOrder,
  notifyDriverNewAssignment,
  notifyAdmins,
  notifyAdminNewVendor,
  notifyAdminNewDriver,
  STATUS_MESSAGES_UZ
};
