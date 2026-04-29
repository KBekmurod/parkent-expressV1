/**
 * Auto-assign service
 *
 * Buyurtma "ready" holatiga o'tganda avtomatik ravishda
 * eng yaqin, bo'sh, online haydovchini biriktiradi.
 *
 * Race condition'ga qarshi atomic yangilash ishlatiladi:
 *   findOneAndUpdate({ ..., $expr: { $lt: [size, MAX] } }, { $push })
 * Agar haydovchi shu vaqtda boshqa orderga biriktirilsa,
 * yangilash muvaffaqiyatsiz bo'ladi va keyingi haydovchini sinab ko'radi.
 */
const Driver = require('../models/Driver.model');
const Order = require('../models/Order.model');
const Vendor = require('../models/Vendor.model');
const logger = require('../utils/logger');
const { PLATFORM_CONFIG } = require('../config/constants');

/**
 * Haversine formulasi bilan ikki nuqta orasidagi masofani (km) hisoblash
 */
const haversineKm = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLng = (lng2 - lng1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Masofaga qarab yetkazib berish narxini hisoblash
 */
const calcDeliveryFee = (distanceKm) => {
  const BASE_FEE  = 3000;
  const PER_KM    = 1000;
  const MIN_FEE   = 3000;
  const MAX_FEE   = 25000;
  const fee = Math.round(BASE_FEE + distanceKm * PER_KM);
  return Math.min(Math.max(fee, MIN_FEE), MAX_FEE);
};

/**
 * Bitta haydovchini buyurtmaga atomic biriktirish
 * Race condition'ga qarshi: $expr ichida currentOrders.length < MAX tekshiruvi
 * Agar muvaffaqiyatli yangilash bo'lmasa, false qaytaradi (haydovchi band bo'lib qolgan)
 *
 * @returns {boolean} muvaffaqiyatli biriktirilgan bo'lsa true
 */
const tryAssignDriverAtomic = async (driverId, orderId) => {
  const result = await Driver.findOneAndUpdate(
    {
      _id: driverId,
      status: 'active',
      isOnline: true,
      $expr: { $lt: [{ $size: '$currentOrders' }, PLATFORM_CONFIG.MAX_DRIVER_ORDERS] }
    },
    {
      $push: { currentOrders: orderId }
    },
    { new: true }
  );
  return !!result;
};

/**
 * Buyurtmaga eng yaqin bo'sh haydovchini avtomatik biriktirish
 *
 * Algoritm:
 *   1. Vendor joylashuvini olish
 *   2. Online va bo'sh haydovchilar ro'yxatini olish
 *   3. Masofa bo'yicha saralash
 *   4. Eng yaqin haydovchini ATOMIC tarzda biriktirishga harakat qilish
 *   5. Agar muvaffaqiyatsiz (race condition) — keyingisini sinash
 *
 * @param {Object} order  — Mongoose Order hujjati
 * @param {Object} [io]   — Socket.io instance (ixtiyoriy)
 * @returns {Object|null} — Biriktirilgan Driver yoki null
 */
const autoAssignDriver = async (order, io = null) => {
  try {
    // 1. Vendor joylashuvini aniqlash
    let vendorLat, vendorLng;
    if (order.vendor && order.vendor.location) {
      vendorLat = order.vendor.location.lat;
      vendorLng = order.vendor.location.lng;
    } else {
      const vendor = await Vendor.findById(order.vendor).select('location');
      if (!vendor) {
        logger.warn(`autoAssign: vendor topilmadi — order ${order._id}`);
        return null;
      }
      vendorLat = vendor.location.lat;
      vendorLng = vendor.location.lng;
    }

    // 2. Bo'sh haydovchilarni olish
    const availableDrivers = await Driver.find({
      status: 'active',
      isOnline: true,
      $expr: { $lt: [{ $size: '$currentOrders' }, PLATFORM_CONFIG.MAX_DRIVER_ORDERS] }
    }).select('firstName lastName phone vehicle currentLocation currentOrders telegramId rating');

    if (availableDrivers.length === 0) {
      logger.info(`autoAssign: bo'sh haydovchi yo'q — order ${order._id}`);
      return null;
    }

    // 3. Masofa bo'yicha saralash
    const withDistance = availableDrivers
      .filter(d => d.currentLocation && d.currentLocation.lat && d.currentLocation.lng)
      .map(driver => ({
        driver,
        distanceKm: haversineKm(
          driver.currentLocation.lat,
          driver.currentLocation.lng,
          vendorLat,
          vendorLng
        )
      }))
      .sort((a, b) => a.distanceKm - b.distanceKm);

    const withoutLocation = availableDrivers
      .filter(d => !d.currentLocation || !d.currentLocation.lat)
      .map(driver => ({ driver, distanceKm: Infinity }));

    const sorted = [...withDistance, ...withoutLocation];
    if (sorted.length === 0) return null;

    // 4. Eng yaqin haydovchini ATOMIC biriktirishga harakat qilish (race-safe)
    let assignedDriver = null;
    for (const candidate of sorted) {
      const success = await tryAssignDriverAtomic(candidate.driver._id, order._id);
      if (success) {
        assignedDriver = candidate.driver;
        break;
      }
      // Agar bu haydovchi shu vaqtda band bo'lib qolgan bo'lsa, keyingisi sinaladi
      logger.info(`autoAssign: ${candidate.driver.firstName} band bo'lib qolgan, keyingisini sinaymiz`);
    }

    if (!assignedDriver) {
      logger.warn(`autoAssign: barcha haydovchilar band bo'lib qolgan — order ${order._id}`);
      return null;
    }

    // 5. Buyurtma holatini yangilash
    const updatedOrder = await Order.findByIdAndUpdate(
      order._id,
      { driver: assignedDriver._id, status: 'assigned' },
      { new: true }
    ).populate([
      { path: 'customer', select: 'firstName lastName phone' },
      { path: 'vendor', select: 'name phone address location' },
      { path: 'driver', select: 'firstName lastName phone vehicle currentLocation' }
    ]);

    if (!updatedOrder) {
      // Agar order topilmadi/o'chirilgan bo'lsa, haydovchidan ham olib tashlash
      await Driver.findByIdAndUpdate(assignedDriver._id, {
        $pull: { currentOrders: order._id }
      });
      return null;
    }

    // 6. Socket.io orqali haydovchiga bildirishnoma
    if (io) {
      io.to(`driver:${assignedDriver._id}`).emit('order:new_assignment', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        message: 'Sizga yangi buyurtma biriktirildi!'
      });
    }

    // 7. Telegram bot orqali bildirishnoma (background)
    try {
      const { notifyDriverNewAssignment, notifyCustomer } = require('./notification.service');
      notifyDriverNewAssignment(updatedOrder, assignedDriver._id).catch(err =>
        logger.warn('Driver notify error:', err.message)
      );
      // Mijozga ham xabar — kuryer biriktirildi
      notifyCustomer(updatedOrder, 'assigned').catch(err =>
        logger.warn('Customer notify error:', err.message)
      );
    } catch (err) {
      logger.warn('Notification service xatosi:', err.message);
    }

    logger.info(
      `autoAssign: ${assignedDriver.firstName} (${(sorted.find(s => s.driver._id.equals(assignedDriver._id))?.distanceKm || 0).toFixed(1)} km) ` +
      `→ order ${order._id}`
    );

    return assignedDriver;
  } catch (error) {
    logger.error('autoAssign xatosi:', error);
    return null;
  }
};

module.exports = {
  autoAssignDriver,
  tryAssignDriverAtomic,
  calcDeliveryFee,
  haversineKm
};
