/**
 * Bot state store — global.Map larni Redis bilan almashtiradi.
 * Redis bo'lmasa xotirada ishlaydi (development).
 *
 * Namespaces:
 *   driver_reg:<chatId>       — haydovchi ro'yxatdan o'tish holati
 *   driver_reject:<chatId>    — haydovchi rad etish sababi
 *   vendor_reject:<chatId>    — sotuvchi rad etish sababi
 *   cart:<chatId>             — customer bot savat (Telegram)
 */
const redis = require('./redis');

const TTL = {
  REGISTRATION: 60 * 60,      // 1 soat
  REJECTION: 5 * 60,          // 5 daqiqa
  CART: 60 * 60 * 24          // 24 soat
};

// ─── Driver registration ────────────────────────────────────────────
const getDriverReg = (chatId) => redis.get(`driver_reg:${chatId}`);
const setDriverReg = (chatId, state) => redis.set(`driver_reg:${chatId}`, state, TTL.REGISTRATION);
const delDriverReg = (chatId) => redis.del(`driver_reg:${chatId}`);

// ─── Driver rejection input ─────────────────────────────────────────
const getDriverReject = (chatId) => redis.get(`driver_reject:${chatId}`);
const setDriverReject = (chatId, orderId) => redis.set(`driver_reject:${chatId}`, orderId, TTL.REJECTION);
const delDriverReject = (chatId) => redis.del(`driver_reject:${chatId}`);

// ─── Vendor rejection input ─────────────────────────────────────────
const getVendorReject = (chatId) => redis.get(`vendor_reject:${chatId}`);
const setVendorReject = (chatId, orderId) => redis.set(`vendor_reject:${chatId}`, orderId, TTL.REJECTION);
const delVendorReject = (chatId) => redis.del(`vendor_reject:${chatId}`);

// ─── Customer bot cart (Telegram) ───────────────────────────────────
const getBotCart = (chatId) => redis.get(`cart:${chatId}`);
const setBotCart = (chatId, cart) => redis.set(`cart:${chatId}`, cart, TTL.CART);
const delBotCart = (chatId) => redis.del(`cart:${chatId}`);

module.exports = {
  // Driver registration
  getDriverReg,
  setDriverReg,
  delDriverReg,
  // Driver rejection
  getDriverReject,
  setDriverReject,
  delDriverReject,
  // Vendor rejection
  getVendorReject,
  setVendorReject,
  delVendorReject,
  // Bot cart
  getBotCart,
  setBotCart,
  delBotCart
};

// ─── Vendor registration ─────────────────────────────────────────────
const getVendorReg = (chatId) => redis.get(`vendor_reg:${chatId}`);
const setVendorReg = (chatId, state) => redis.set(`vendor_reg:${chatId}`, state, TTL.REGISTRATION);
const delVendorReg = (chatId) => redis.del(`vendor_reg:${chatId}`);

// ─── Vendor product creation ─────────────────────────────────────────
const getProductCreate = (chatId) => redis.get(`product_create:${chatId}`);
const setProductCreate = (chatId, state) => redis.set(`product_create:${chatId}`, state, TTL.REGISTRATION);
const delProductCreate = (chatId) => redis.del(`product_create:${chatId}`);

// ─── Vendor product edit ─────────────────────────────────────────────
const getProductEdit = (chatId) => redis.get(`product_edit:${chatId}`);
const setProductEdit = (chatId, state) => redis.set(`product_edit:${chatId}`, state, TTL.REGISTRATION);
const delProductEdit = (chatId) => redis.del(`product_edit:${chatId}`);

// ─── Customer pending address ────────────────────────────────────────
const getPendingAddress = (chatId) => redis.get(`pending_addr:${chatId}`);
const setPendingAddress = (chatId, loc) => redis.set(`pending_addr:${chatId}`, loc, TTL.REJECTION);
const delPendingAddress = (chatId) => redis.del(`pending_addr:${chatId}`);

// ─── Driver location tracking ────────────────────────────────────────
const getDriverTracking = (driverId) => redis.get(`drv_track:${driverId}`);
const setDriverTracking = (driverId, data) => redis.set(`drv_track:${driverId}`, data, 60 * 60);
const delDriverTracking = (driverId) => redis.del(`drv_track:${driverId}`);

module.exports = Object.assign(module.exports, {
  getVendorReg, setVendorReg, delVendorReg,
  getProductCreate, setProductCreate, delProductCreate,
  getProductEdit, setProductEdit, delProductEdit,
  getPendingAddress, setPendingAddress, delPendingAddress,
  getDriverTracking, setDriverTracking, delDriverTracking
});
