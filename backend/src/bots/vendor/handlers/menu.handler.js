const store = require('../../../utils/botStateStore');
const axios = require('axios');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');
const FormData = require('form-data');
const { MESSAGES } = require('../utils/messages');
const { getProductMenuKeyboard, getProductActionKeyboard, getProductPaginationKeyboard, getSkipKeyboard } = require('../keyboards/productMenu');
const { formatPrice, truncateText } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store product creation states


// Store product edit states


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
  store.setProductCreate(chatId, {
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
  
  const creationState = await store.getProductCreate(chatId);
  const editState = await store.getProductEdit(chatId);

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
      store.setProductCreate(chatId, state);
      
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
      store.setProductCreate(chatId, state);
      
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
      store.setProductCreate(chatId, state);
      
      await bot.sendMessage(chatId, MESSAGES.uz.enterProductCategory);
    } else if (step === 'category') {
      state.data.category = text.trim();
      state.step = 'preparation_time';
      store.setProductCreate(chatId, state);
      
      await bot.sendMessage(chatId, MESSAGES.uz.enterPreparationTime);
    } else if (step === 'preparation_time') {
      const time = parseInt(text);
      if (isNaN(time) || time <= 0) {
        await bot.sendMessage(chatId, MESSAGES.uz.invalidTime);
        return;
      }
      
      state.data.preparationTime = time;
      state.step = 'description_uz';
      store.setProductCreate(chatId, state);
      
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
      store.setProductCreate(chatId, state);
      
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
      store.setProductCreate(chatId, state);
      
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
 * Handle photo upload during product creation or editing
 * @param {TelegramBot} bot - Bot instance
 * @param {Object} msg - Message object with photo
 */
const handlePhotoMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Check if user is in product creation flow
    const createState = await store.getProductCreate(chatId);
    const editState = await store.getProductEdit(chatId);
    
    if (!createState && !editState) {
      // Not in photo upload flow, ignore
      return;
    }

    // Get the highest resolution photo
    const photo = msg.photo[msg.photo.length - 1];
    const fileId = photo.file_id;

    // Download file from Telegram
    const file = await bot.getFile(fileId);
    const fileLink = await bot.getFileLink(fileId);
    
    // Extract file extension from file path
    const fileExt = path.extname(file.file_path) || '.jpg';

    // Download photo
    const response = await axios.get(fileLink, { responseType: 'stream' });
    const tempPath = path.join(__dirname, '../../../uploads/temp', `${fileId}${fileExt}`);
    
    // Ensure temp directory exists
    const tempDir = path.dirname(tempPath);
    if (!fsSync.existsSync(tempDir)) {
      fsSync.mkdirSync(tempDir, { recursive: true });
    }

    const writer = fsSync.createWriteStream(tempPath);
    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });

    if (createState && createState.step === 'photo') {
      // Product creation flow
      await bot.sendMessage(chatId, '⏳ Rasm yuklanmoqda...');

      // Create product first without photo
      const productData = {
        vendor: createState.vendorId,
        name: createState.data.name,
        price: createState.data.price,
        category: createState.data.category,
        preparationTime: createState.data.preparationTime
      };
      
      // Only add description if it exists
      if (createState.data.description) {
        productData.description = createState.data.description;
      }

      const productResponse = await axios.post(`${API_URL}/products`, productData);
      const productId = productResponse.data.data.product._id;

      // Upload photo
      const formData = new FormData();
      formData.append('photo', fsSync.createReadStream(tempPath));

      await axios.post(`${API_URL}/products/${productId}/photo`, formData, {
        headers: formData.getHeaders()
      });

      // Clean up temp file
      fsSync.unlinkSync(tempPath);

      // Clear state
      await store.delProductCreate(chatId);

      await bot.sendMessage(
        chatId,
        '✅ Mahsulot muvaffaqiyatli qo\'shildi!\n\n' +
        'Admin tomonidan tasdiqlanganidan keyin ko\'rinadi.',
        {
          reply_markup: {
            keyboard: [
              ['📋 Menyuni ko\'rish', '➕ Mahsulot qo\'shish'],
              ['📦 Buyurtmalar', '📊 Statistika'],
              ['👤 Profil', '⚙️ Sozlamalar']
            ],
            resize_keyboard: true
          }
        }
      );

      logger.info(`Product created with photo by vendor ${createState.vendorId}`);
      
    } else if (editState && editState.step === 'photo') {
      // Product edit flow - upload new photo
      await bot.sendMessage(chatId, '⏳ Rasm yangilanmoqda...');

      const formData = new FormData();
      formData.append('photo', fsSync.createReadStream(tempPath));

      await axios.post(`${API_URL}/products/${editState.productId}/photo`, formData, {
        headers: formData.getHeaders()
      });

      // Clean up
      fsSync.unlinkSync(tempPath);
      await store.delProductEdit(chatId);

      await bot.sendMessage(chatId, '✅ Rasm yangilandi!');
      logger.info(`Product photo updated: ${editState.productId}`);
    }

  } catch (error) {
    logger.error('Error handling photo message:', error);
    
    // Clean up temp file if exists
    try {
      const fileId = msg.photo[msg.photo.length - 1].file_id;
      const file = await bot.getFile(fileId);
      const fileExt = path.extname(file.file_path) || '.jpg';
      const tempPath = path.join(__dirname, '../../../uploads/temp', `${fileId}${fileExt}`);
      if (fsSync.existsSync(tempPath)) {
        fsSync.unlinkSync(tempPath);
        logger.debug(`Cleaned up temp file: ${tempPath}`);
      }
    } catch (cleanupError) {
      logger.warn('Error cleaning up temp file:', cleanupError);
    }

    await bot.sendMessage(
      chatId,
      '❌ Rasm yuklashda xatolik yuz berdi. Qaytadan urinib ko\'ring.',
      {
        reply_markup: {
          keyboard: [
            ['📋 Menyuni ko\'rish', '➕ Mahsulot qo\'shish'],
            ['📦 Buyurtmalar', '📊 Statistika'],
            ['👤 Profil', '⚙️ Sozlamalar']
          ],
          resize_keyboard: true
        }
      }
    );

    // Clear states
    await store.delProductCreate(chatId);
    await store.delProductEdit(chatId);
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
    await store.delProductCreate(chatId);

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
    await store.delProductCreate(chatId);
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

/**
 * Handle document upload (same as photo, for drag & drop files)
 * @param {TelegramBot} bot - Bot instance
 * @param {Object} msg - Message object with document
 */
const handleDocumentMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  
  try {
    // Check if document is an image
    if (msg.document && msg.document.mime_type && msg.document.mime_type.startsWith('image/')) {
      // Create a new message object with photo property for handlePhotoMessage
      const photoMsg = {
        ...msg,
        photo: [{ file_id: msg.document.file_id }]
      };
      await handlePhotoMessage(bot, photoMsg);
    } else {
      await bot.sendMessage(
        chatId,
        '❌ Faqat rasm fayllari qabul qilinadi (JPG, PNG)'
      );
    }
  } catch (error) {
    logger.error('Error handling document message:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

module.exports = {
  showMenu,
  handleMenuCallback,
  handleProductCallback,
  handleTextMessage,
  handlePhotoMessage,
  handleDocumentMessage
};
