const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const { MESSAGES } = require('../utils/messages');
const { getProductMenuKeyboard, getProductActionKeyboard, getProductPaginationKeyboard, getSkipKeyboard } = require('../keyboards/productMenu');
const { formatPrice, truncateText } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store product creation states
if (!global.productCreationStates) {
  global.productCreationStates = new Map();
}

// Store product edit states
if (!global.productEditStates) {
  global.productEditStates = new Map();
}

/**
 * Show menu/products
 */
const showMenu = async (bot, chatId, vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/products/vendor/${vendorId}`);
    const products = response.data.data.products;

    if (products.length === 0) {
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.menuEmpty,
        {
          reply_markup: getProductMenuKeyboard(vendorId, 'uz')
        }
      );
      return;
    }

    // Send products list
    let message = '🍽️ *Menyu*\n\n';
    
    products.slice(0, 10).forEach((product, i) => {
      const productName = product.name?.uz || product.name;
      const status = product.isAvailable ? '✅' : '❌';
      message += `${i + 1}. ${status} *${productName}*\n`;
      message += `   💰 ${formatPrice(product.price)}\n`;
      if (product.discount > 0) {
        message += `   🏷️ Chegirma: ${product.discount}%\n`;
      }
      message += '\n';
    });

    await bot.sendMessage(
      chatId,
      message,
      {
        parse_mode: 'Markdown',
        reply_markup: getProductMenuKeyboard(vendorId, 'uz')
      }
    );
  } catch (error) {
    logger.error('Error showing menu:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle menu callback
 */
const handleMenuCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  try {
    const parts = data.split(':');
    const action = parts[1];

    if (action === 'main') {
      // Return to main menu - handled by main index
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling menu callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: MESSAGES.uz.error,
      show_alert: true
    });
  }
};

/**
 * Handle product callback
 */
const handleProductCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
    // Get vendor
    const vendorResponse = await axios.get(`${API_URL}/vendors/telegram/${telegramId}`);
    const vendor = vendorResponse.data.data.vendor;

    const parts = data.split(':');
    const action = parts[1];
    const targetId = parts[2];

    if (action === 'add') {
      await startProductCreation(bot, chatId, vendor._id);
    } else if (action === 'list') {
      await showMenu(bot, chatId, vendor._id);
    } else if (action === 'view') {
      await showProductDetails(bot, chatId, targetId);
    } else if (action === 'toggle') {
      await toggleProduct(bot, chatId, messageId, targetId);
    } else if (action === 'edit') {
      // Not implemented yet - would show edit field selection
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling product callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, {
      text: MESSAGES.uz.error,
      show_alert: true
    });
  }
};

/**
 * Start product creation flow
 */
const startProductCreation = async (bot, chatId, vendorId) => {
  global.productCreationStates.set(chatId, {
    vendorId,
    step: 'name_uz',
    data: {}
  });

  await bot.sendMessage(
    chatId,
    MESSAGES.uz.enterProductName,
    {
      reply_markup: { remove_keyboard: true }
    }
  );
};

/**
 * Handle text message during product creation/edit
 */
const handleTextMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  
  const creationState = global.productCreationStates.get(chatId);
  const editState = global.productEditStates.get(chatId);

  if (creationState) {
    await handleProductCreationStep(bot, msg, creationState);
  } else if (editState) {
    await handleProductEditStep(bot, msg, editState);
  }
};

/**
 * Handle product creation steps
 */
const handleProductCreationStep = async (bot, msg, state) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const step = state.step;

  try {
    if (step === 'name_uz') {
      state.data.name = { uz: text.trim() };
      state.step = 'name_ru';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.enterProductNameRu,
        {
          reply_markup: getSkipKeyboard('uz'),
          parse_mode: 'Markdown'
        }
      );
    } else if (step === 'name_ru') {
      if (text !== "O'tkazib yuborish" && text !== 'Пропустить') {
        state.data.name.ru = text.trim();
      }
      state.step = 'price';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.enterProductPrice,
        {
          reply_markup: { remove_keyboard: true }
        }
      );
    } else if (step === 'price') {
      const price = parseFloat(text);
      if (isNaN(price) || price <= 0) {
        await bot.sendMessage(chatId, MESSAGES.uz.invalidPrice);
        return;
      }
      
      state.data.price = price;
      state.step = 'category';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(chatId, MESSAGES.uz.enterProductCategory);
    } else if (step === 'category') {
      state.data.category = text.trim();
      state.step = 'preparation_time';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(chatId, MESSAGES.uz.enterPreparationTime);
    } else if (step === 'preparation_time') {
      const time = parseInt(text);
      if (isNaN(time) || time <= 0) {
        await bot.sendMessage(chatId, MESSAGES.uz.invalidTime);
        return;
      }
      
      state.data.preparationTime = time;
      state.step = 'description_uz';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.enterProductDescription,
        {
          reply_markup: getSkipKeyboard('uz'),
          parse_mode: 'Markdown'
        }
      );
    } else if (step === 'description_uz') {
      if (text !== "O'tkazib yuborish" && text !== 'Пропустить') {
        state.data.description = { uz: text.trim() };
      }
      state.step = 'description_ru';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.enterProductDescriptionRu,
        {
          reply_markup: getSkipKeyboard('uz'),
          parse_mode: 'Markdown'
        }
      );
    } else if (step === 'description_ru') {
      if (text !== "O'tkazib yuborish" && text !== 'Пропустить') {
        if (!state.data.description) {
          state.data.description = {};
        }
        state.data.description.ru = text.trim();
      }
      state.step = 'photo';
      global.productCreationStates.set(chatId, state);
      
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.sendProductPhoto,
        {
          reply_markup: getSkipKeyboard('uz'),
          parse_mode: 'Markdown'
        }
      );
    } else if (step === 'photo') {
      if (text === "O'tkazib yuborish" || text === 'Пропустить') {
        // Complete without photo
        await completeProductCreation(bot, chatId, state);
      }
    }
  } catch (error) {
    logger.error('Error handling product creation step:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle photo message during product creation
 */
const handlePhotoMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const state = global.productCreationStates.get(chatId);

  if (!state || state.step !== 'photo') {
    return;
  }

  try {
    // Get the largest photo
    const photos = msg.photo;
    const photo = photos[photos.length - 1];
    
    // Download photo
    const file = await bot.getFile(photo.file_id);
    const fileUrl = `https://api.telegram.org/file/bot${process.env.VENDOR_BOT_TOKEN}/${file.file_path}`;
    
    state.data.photoUrl = fileUrl;
    state.data.photoFileId = photo.file_id;
    global.productCreationStates.set(chatId, state);

    await bot.sendMessage(chatId, MESSAGES.uz.photoReceived);
    
    // Complete product creation
    await completeProductCreation(bot, chatId, state);
  } catch (error) {
    logger.error('Error handling photo:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Complete product creation
 */
const completeProductCreation = async (bot, chatId, state) => {
  try {
    const productData = {
      vendor: state.vendorId,
      name: state.data.name,
      description: state.data.description,
      price: state.data.price,
      category: state.data.category,
      preparationTime: state.data.preparationTime
    };

    // Create product
    const response = await axios.post(`${API_URL}/products`, productData);
    const product = response.data.data.product;

    // TODO: Upload photo if provided (requires file upload implementation)

    // Clear state
    global.productCreationStates.delete(chatId);

    // Send confirmation
    const productName = product.name?.uz || product.name;
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.productAdded(productName),
      {
        parse_mode: 'Markdown',
        reply_markup: getProductMenuKeyboard(state.vendorId, 'uz')
      }
    );

    logger.info(`Product created: ${productName} for vendor ${state.vendorId}`);
  } catch (error) {
    logger.error('Error completing product creation:', error);
    
    let errorMessage = MESSAGES.uz.error;
    if (error.response?.data?.message) {
      errorMessage += `\n\n${error.response.data.message}`;
    }
    
    await bot.sendMessage(chatId, errorMessage);
    
    // Clear state
    global.productCreationStates.delete(chatId);
  }
};

/**
 * Handle product edit step
 */
const handleProductEditStep = async (bot, msg, state) => {
  // TODO: Implement product edit flow
};

/**
 * Show product details
 */
const showProductDetails = async (bot, chatId, productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    const product = response.data.data.product;

    const productName = product.name?.uz || product.name;
    const productDesc = product.description?.uz || product.description || 'Ta\'rif yo\'q';
    
    let message = `🍽️ *${productName}*\n\n`;
    message += `📝 ${truncateText(productDesc, 200)}\n\n`;
    message += `💰 Narx: *${formatPrice(product.price)}*\n`;
    message += `🏷️ Kategoriya: ${product.category}\n`;
    message += `⏱️ Tayyorlash: ${product.preparationTime} daqiqa\n`;
    message += `🔄 Holat: ${product.isAvailable ? '✅ Faol' : '❌ Nofaol'}\n`;

    if (product.discount > 0) {
      message += `\n🏷️ Chegirma: ${product.discount}%`;
    }

    await bot.sendMessage(
      chatId,
      message,
      {
        parse_mode: 'Markdown',
        reply_markup: getProductActionKeyboard(productId, product.isAvailable, 'uz')
      }
    );
  } catch (error) {
    logger.error('Error showing product details:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Toggle product availability
 */
const toggleProduct = async (bot, chatId, messageId, productId) => {
  try {
    const response = await axios.put(`${API_URL}/products/${productId}/toggle`);
    const product = response.data.data.product;

    const productName = product.name?.uz || product.name;
    
    await bot.editMessageText(
      MESSAGES.uz.productToggled(productName, product.isAvailable),
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: getProductActionKeyboard(productId, product.isAvailable, 'uz')
      }
    );

    logger.info(`Product ${productName} toggled: ${product.isAvailable}`);
  } catch (error) {
    logger.error('Error toggling product:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

module.exports = {
  showMenu,
  handleMenuCallback,
  handleProductCallback,
  handleTextMessage,
  handlePhotoMessage
};
