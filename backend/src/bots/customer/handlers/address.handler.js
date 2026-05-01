const store = require('../../../utils/botStateStore');
const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');
const orderHandler = require('./order.handler');
const paymentHandler = require('./payment.handler');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

const requestAddress = async (bot, chatId) => {
  try {
    const telegramId = chatId.toString();
    const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = response.data.data.user;

    if (user.addresses && user.addresses.length > 0) {
      const keyboard = {
        inline_keyboard: [
          ...user.addresses.map((addr, index) => [{
            text: `📍 ${addr.title || addr.address}`,
            callback_data: `address:select:${index}`
          }]),
          [{ text: "➕ Yangi manzil qo'shish", callback_data: 'address:new' }]
        ]
      };
      await bot.sendMessage(chatId, MESSAGES.uz.selectAddress, { reply_markup: keyboard });
    } else {
      await bot.sendMessage(chatId, MESSAGES.uz.requestLocation, {
        reply_markup: {
          keyboard: [[{ text: '📍 Manzilni yuborish', request_location: true }]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });
    }
  } catch (error) {
    logger.error('Error requesting address:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// Location keldi — koordinatalarni saqlap, manzil nomini so'raymiz
const handleLocationMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const { latitude, longitude } = msg.location;

  try {
    await store.setPendingAddress(chatId, { lat: latitude, lng: longitude });
    await bot.sendMessage(chatId, MESSAGES.uz.requestAddressTitle, {
      reply_markup: {
        keyboard: [['🏠 Uy', '🏢 Ish', '📍 Boshqa']],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  } catch (error) {
    logger.error('Error handling location:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// Manzil nomi keldi — buyurtmani yaratamiz
const handleAddressTitle = async (bot, msg) => {
  const chatId = msg.chat.id;
  const title = msg.text;

  try {
    const pendingAddress = await store.getPendingAddress(chatId);
    if (!pendingAddress) return false; // Bu handler uchun emas

    const telegramId = chatId.toString();
    const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
    const user = response.data.data.user;

    // Manzilni saqlash
    const deliveryAddress = {
      title: title,
      address: title,
      location: pendingAddress
    };

    // Manzilni foydalanuvchiga saqlash
    try {
      await axios.post(`${API_URL}/users/${user._id}/addresses`, deliveryAddress);
    } catch (e) {
      // Manzil saqlanmasa ham davom etamiz
    }

    await store.delPendingAddress(chatId);

    // To'lov metodini olib buyurtma yaratamiz
    const paymentMethod = paymentHandler.getPaymentMethod(chatId);
    await orderHandler.createOrder(bot, chatId, user._id, deliveryAddress, paymentMethod);

    return true;
  } catch (error) {
    logger.error('Error handling address title:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
    return true;
  }
};

const handleAddressCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const action = data[1];

  await bot.answerCallbackQuery(callbackQuery.id);

  if (action === 'select') {
    const addressIndex = parseInt(data[2]);
    try {
      const telegramId = chatId.toString();
      const response = await axios.get(`${API_URL}/users/telegram/${telegramId}`);
      const user = response.data.data.user;
      const address = user.addresses[addressIndex];
      const paymentMethod = paymentHandler.getPaymentMethod(chatId);
      await orderHandler.createOrder(bot, chatId, user._id, address, paymentMethod);
    } catch (error) {
      logger.error('Error selecting address:', error);
      await bot.sendMessage(chatId, MESSAGES.uz.error);
    }
  } else if (action === 'new') {
    await bot.sendMessage(chatId, MESSAGES.uz.requestLocation, {
      reply_markup: {
        keyboard: [[{ text: '📍 Manzilni yuborish', request_location: true }]],
        resize_keyboard: true,
        one_time_keyboard: true
      }
    });
  }
};

module.exports = {
  requestAddress,
  handleLocationMessage,
  handleAddressTitle,
  handleAddressCallback
};
