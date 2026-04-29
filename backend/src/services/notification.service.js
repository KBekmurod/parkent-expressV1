/**
 * Notification service
 *
 * Buyurtma holatlari o'zgarganda Telegram bot orqali
 * mijoz, sotuvchi va haydovchiga xabar yuboradi.
 */
const mongoose = require('mongoose');
const logger = require('../utils/logger');

const STATUS_MESSAGES_UZ = {
  pending: '⏳ Buyurtmangiz qabul qilindi va tekshirilmoqda',
  accepted: '✅ Restoran buyurtmangizni qabul qildi',
  preparing: '👨‍🍳 Buyurtmangiz tayyorlanmoqda',
  ready: '🍽️ Buyurtma tayyor, kuryer qidirilmoqda',
  assigned: '🚴 Kuryer biriktirildi va yo\'lda',
  picked_up: '📦 Kuryer buyurtmangizni oldi',
  on_the_way: '🛵 Kuryer sizga yo\'l olmoqda',
  delivered: '🎉 Buyurtmangiz yetkazib berildi! Yoqimli ishtaha!',
  cancelled: '❌ Buyurtmangiz bekor qilindi',
  rejected: '❌ Restoran buyurtmangizni rad etdi'
};

/**
 * Mijozga buyurtma holati o'zgargani haqida xabar yuborish
 */
const notifyCustomer = async (order, status) => {
  try {
    if (!order.customer) return;

    let user = order.customer;
    // Agar populate qilinmagan bo'lsa (faqat ID), DB'dan olamiz
    if (typeof user === 'string' || user instanceof mongoose.Types.ObjectId) {
      const User = require('../models/User.model');
      user = await User.findById(user).select('telegramId authType');
    }

    // Faqat Telegram foydalanuvchilariga yuboriladi (web mijozlar socket orqali oladi)
    if (!user || user.authType === 'web' || !user.telegramId) return;

    const message = STATUS_MESSAGES_UZ[status] || `Buyurtma holati: ${status}`;
    const fullMessage = `📦 Buyurtma #${order.orderNumber}\n\n${message}`;

    try {
      const { getCustomerBot } = require('../bots/customer');
      const bot = getCustomerBot();
      if (bot) {
        await bot.sendMessage(user.telegramId, fullMessage);
      }
    } catch (botErr) {
      logger.warn(`Customer bot bildirishnomasi: ${botErr.message}`);
    }
  } catch (err) {
    logger.error('notifyCustomer xatosi:', err);
  }
};

/**
 * Sotuvchiga yangi buyurtma haqida xabar yuborish
 */
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
      `📦 Buyurtma: #${order.orderNumber}\n` +
      `💰 Summa: ${order.total?.toLocaleString()} so'm\n\n` +
      `Botda buyurtmani ko'rish uchun /start bosing.`;

    try {
      const { getVendorBot } = require('../bots/vendor');
      const bot = getVendorBot();
      if (bot) {
        await bot.sendMessage(vendor.telegramId, message, { parse_mode: 'Markdown' });
      }
    } catch (botErr) {
      logger.warn(`Vendor bot bildirishnomasi: ${botErr.message}`);
    }
  } catch (err) {
    logger.error('notifyVendor xatosi:', err);
  }
};

/**
 * Haydovchiga yangi tayinlangan buyurtma haqida xabar yuborish
 */
const notifyDriverNewAssignment = async (order, driverId) => {
  try {
    const Driver = require('../models/Driver.model');
    const driver = await Driver.findById(driverId).select('telegramId firstName');

    if (!driver || !driver.telegramId) return;

    const message =
      `🔔 *Sizga yangi buyurtma!*\n\n` +
      `📦 Buyurtma: #${order.orderNumber}\n` +
      `💰 Summa: ${order.total?.toLocaleString()} so'm\n\n` +
      `Botda buyurtmani ko'rish uchun /start bosing.`;

    try {
      const { getDriverBot } = require('../bots/driver');
      const bot = getDriverBot();
      if (bot) {
        await bot.sendMessage(driver.telegramId, message, { parse_mode: 'Markdown' });
      }
    } catch (botErr) {
      logger.warn(`Driver bot bildirishnomasi: ${botErr.message}`);
    }
  } catch (err) {
    logger.error('notifyDriver xatosi:', err);
  }
};

module.exports = {
  notifyCustomer,
  notifyVendorNewOrder,
  notifyDriverNewAssignment,
  STATUS_MESSAGES_UZ
};
