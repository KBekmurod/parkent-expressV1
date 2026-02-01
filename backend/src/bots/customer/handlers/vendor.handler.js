const axios = require('axios');
const { MESSAGES } = require('../utils/messages');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Temporary cart storage (in production, use Redis or Database)
// TODO: Replace with Redis-based storage for production use to support:
// - Persistence across server restarts
// - Multi-instance deployments
// - Better scalability
const userCarts = new Map();

/**
 * Show vendor list
 */
const showVendorList = async (bot, chatId, category = null) => {
  try {
    const params = category ? { category } : { status: 'active', isOpen: true };
    const response = await axios.get(`${API_URL}/vendors`, { params });
    const vendors = response.data.data.vendors;

    if (vendors.length === 0) {
      return await bot.sendMessage(chatId, MESSAGES.uz.noVendors);
    }

    const keyboard = {
      inline_keyboard: vendors.map(vendor => [{
        text: `${vendor.name} ⭐ ${vendor.rating.toFixed(1)}`,
        callback_data: `vendor:${vendor._id}`
      }])
    };

    await bot.sendMessage(
      chatId,
      MESSAGES.uz.selectVendor,
      { reply_markup: keyboard }
    );
  } catch (error) {
    logger.error('Error showing vendor list:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show vendor menu
 */
const showVendorMenu = async (bot, chatId, vendorId) => {
  try {
    // Get vendor info
    const vendorResponse = await axios.get(`${API_URL}/vendors/${vendorId}`);
    const vendor = vendorResponse.data.data.vendor;

    // Get vendor products
    const productsResponse = await axios.get(`${API_URL}/products/vendor/${vendorId}`, {
      params: { isAvailable: true }
    });
    const products = productsResponse.data.data.products;

    if (products.length === 0) {
      return await bot.sendMessage(chatId, MESSAGES.uz.noProducts);
    }

    // Group products by category
    const categories = {};
    products.forEach(product => {
      if (!categories[product.category]) {
        categories[product.category] = [];
      }
      categories[product.category].push(product);
    });

    // Send vendor info
    let message = `🏪 *${vendor.name}*\n\n`;
    message += `⭐ Reyting: ${vendor.rating.toFixed(1)}\n`;
    message += `📍 ${vendor.address}\n`;
    message += `🕒 ${vendor.workingHours.start} - ${vendor.workingHours.end}\n\n`;
    message += `📋 *Menyu:*`;

    await bot.sendMessage(chatId, message, { parse_mode: 'Markdown' });

    // Send products by category
    for (const [category, items] of Object.entries(categories)) {
      const keyboard = {
        inline_keyboard: items.map(product => {
          const price = product.discount > 0 
            ? `~~${product.price}~~ ${product.finalPrice} so'm`
            : `${product.price} so'm`;
          
          return [{
            text: `${product.name.uz} - ${price}`,
            callback_data: `product:${product._id}`
          }];
        })
      };

      await bot.sendMessage(
        chatId,
        `📂 *${category}*`,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
    }

    // Cart button
    const cart = userCarts.get(chatId) || [];
    const cartButton = {
      inline_keyboard: [[
        { text: `🛒 Savat (${cart.length})`, callback_data: 'cart:view' },
        { text: '🔙 Orqaga', callback_data: 'menu:restaurants' }
      ]]
    };

    await bot.sendMessage(
      chatId,
      '👆 Mahsulotni tanlang yoki savatga o\'ting',
      { reply_markup: cartButton }
    );

  } catch (error) {
    logger.error('Error showing vendor menu:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Show product details
 */
const showProductDetails = async (bot, chatId, productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    const product = response.data.data.product;

    let message = `🍽️ *${product.name.uz}*\n\n`;
    message += `${product.description.uz}\n\n`;
    
    if (product.discount > 0) {
      message += `~~${product.price} so'm~~\n`;
      message += `💰 *${product.finalPrice} so'm* (-${product.discount}%)\n\n`;
    } else {
      message += `💰 *${product.price} so'm*\n\n`;
    }
    
    message += `⏱️ Tayyorlanish vaqti: ${product.preparationTime} daqiqa`;

    const keyboard = {
      inline_keyboard: [
        [
          { text: '➖', callback_data: `product:${productId}:decrease` },
          { text: '1', callback_data: `product:${productId}:quantity` },
          { text: '➕', callback_data: `product:${productId}:increase` }
        ],
        [
          { text: '🛒 Savatga qo\'shish', callback_data: `product:${productId}:add:1` }
        ],
        [
          { text: '🔙 Orqaga', callback_data: `vendor:${product.vendor}` }
        ]
      ]
    };

    if (product.photo) {
      await bot.sendPhoto(
        chatId,
        `${process.env.API_URL || 'http://localhost:5000'}/${product.photo}`,
        {
          caption: message,
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
    } else {
      await bot.sendMessage(
        chatId,
        message,
        { 
          parse_mode: 'Markdown',
          reply_markup: keyboard
        }
      );
    }

  } catch (error) {
    logger.error('Error showing product details:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle vendor callback
 */
const handleVendorCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const vendorId = data[1];

  await bot.answerCallbackQuery(callbackQuery.id);
  await showVendorMenu(bot, chatId, vendorId);
};

/**
 * Handle product callback
 */
const handleProductCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data.split(':');
  const productId = data[1];
  const action = data[2];
  const quantity = parseInt(data[3]) || 1;

  if (action === 'add') {
    // Add to cart
    const cart = userCarts.get(chatId) || [];
    const existingItem = cart.find(item => item.productId === productId);

    if (existingItem) {
      existingItem.quantity += quantity;
    } else {
      cart.push({ productId, quantity });
    }

    userCarts.set(chatId, cart);

    await bot.answerCallbackQuery(callbackQuery.id, {
      text: '✅ Savatga qo\'shildi!',
      show_alert: false
    });
  } else {
    await bot.answerCallbackQuery(callbackQuery.id);
    await showProductDetails(bot, chatId, productId);
  }
};

module.exports = {
  showVendorList,
  showVendorMenu,
  showProductDetails,
  handleVendorCallback,
  handleProductCallback,
  userCarts
};
