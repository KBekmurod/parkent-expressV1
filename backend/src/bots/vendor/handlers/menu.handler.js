const store = require('../../../utils/botStateStore');
const axios = require('axios');
const path = require('path');
const fs = require('fs');
const FormData = require('form-data');
const { MESSAGES } = require('../utils/messages');
const { getProductMenuKeyboard, getProductActionKeyboard, getSkipKeyboard } = require('../keyboards/productMenu');
const { formatPrice, truncateText } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Kategoriyalar ro'yxati
const CATEGORIES = [
  '🍕 Pizza', '🍔 Burger', '🍣 Sushi', '🥗 Salat',
  '🍜 Lagmon', '🍲 Milliy taomlar', '🥩 Kabob', '🌯 Lavash',
  '🍰 Shirinliklar', '☕ Ichimliklar', '🍟 Fast food', '🔲 Boshqa'
];

// ─── Menyuni ko'rsatish ────────────────────────────────────────────────────
const showMenu = async (bot, chatId, vendorId) => {
  try {
    const response = await axios.get(`${API_URL}/products/vendor/${vendorId}`);
    const products = response.data.data.products || [];

    if (products.length === 0) {
      await bot.sendMessage(chatId, MESSAGES.uz.menuEmpty, {
        reply_markup: getProductMenuKeyboard(vendorId, 'uz')
      });
      return;
    }

    let message = '🍽️ *Menyu*\n\n';
    products.slice(0, 20).forEach((product, i) => {
      const productName = product.name?.uz || product.name;
      const status = product.isAvailable ? '✅' : '❌';
      message += `${i + 1}. ${status} *${productName}*\n`;
      message += `   💰 ${formatPrice(product.price)}\n`;
      if (product.discount > 0) message += `   🏷️ -${product.discount}%\n`;
      message += '\n';
    });

    // Har bir mahsulot uchun tugma
    const keyboard = {
      inline_keyboard: [
        ...products.slice(0, 10).map(p => [{
          text: `${p.isAvailable ? '✅' : '❌'} ${p.name?.uz || p.name} — ${formatPrice(p.price)}`,
          callback_data: `product:view:${p._id}`
        }]),
        [{ text: "➕ Yangi mahsulot qo'shish", callback_data: `product:add:${vendorId}` }],
        [{ text: '🔙 Bosh menyu', callback_data: 'menu:main' }]
      ]
    };

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: keyboard
    });
  } catch (error) {
    logger.error('Error showing menu:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// ─── Menu callback ─────────────────────────────────────────────────────────
const handleMenuCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const data = callbackQuery.data;

  try {
    const parts = data.split(':');
    const action = parts[1];

    if (action === 'main') {
      const { getMainMenuKeyboard } = require('../keyboards/mainMenu');
      await bot.sendMessage(chatId, '🏠 Bosh menyu:', {
        reply_markup: getMainMenuKeyboard('uz')
      });
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling menu callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error, show_alert: true });
  }
};

// ─── Product callback ──────────────────────────────────────────────────────
const handleProductCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;
  const telegramId = callbackQuery.from.id.toString();

  try {
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
    } else if (action === 'delete') {
      await deleteProduct(bot, chatId, messageId, targetId, vendor._id);
    }

    await bot.answerCallbackQuery(callbackQuery.id);
  } catch (error) {
    logger.error('Error handling product callback:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error, show_alert: true });
  }
};

// ─── Mahsulot qo'shish bosqichlari ────────────────────────────────────────
const startProductCreation = async (bot, chatId, vendorId) => {
  await store.setProductCreate(chatId, { vendorId, step: 'name_uz', data: {} });
  await bot.sendMessage(chatId, '✏️ Mahsulot nomini kiriting (o\'zbekcha):', {
    reply_markup: { remove_keyboard: true }
  });
};

// ─── Text message handler ──────────────────────────────────────────────────
const handleTextMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const creationState = await store.getProductCreate(chatId);
  const editState = await store.getProductEdit(chatId);

  if (creationState) {
    await handleProductCreationStep(bot, msg, creationState);
  } else if (editState) {
    await handleProductEditStep(bot, msg, editState);
  }
};

const handleProductCreationStep = async (bot, msg, state) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const step = state.step;

  try {
    if (step === 'name_uz') {
      state.data.name = { uz: text.trim() };
      state.step = 'price';
      await store.setProductCreate(chatId, state);
      await bot.sendMessage(chatId, '💰 Narxini kiriting (so\'mda, faqat raqam):', {
        reply_markup: { remove_keyboard: true }
      });

    } else if (step === 'price') {
      const price = parseFloat(text.replace(/\s/g, ''));
      if (isNaN(price) || price <= 0) {
        await bot.sendMessage(chatId, '❌ Noto\'g\'ri narx. Faqat raqam kiriting (masalan: 25000):');
        return;
      }
      state.data.price = price;
      state.step = 'category';
      await store.setProductCreate(chatId, state);

      // Kategoriyalar tugmalar bilan
      await bot.sendMessage(chatId, '📂 Kategoriyani tanlang:', {
        reply_markup: {
          keyboard: [
            CATEGORIES.slice(0, 3),
            CATEGORIES.slice(3, 6),
            CATEGORIES.slice(6, 9),
            CATEGORIES.slice(9, 12),
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

    } else if (step === 'category') {
      // Emoji'larni olib tashlash
      state.data.category = text.replace(/[^\w\s\-]/gi, '').trim().toLowerCase();
      state.step = 'description';
      await store.setProductCreate(chatId, state);
      await bot.sendMessage(chatId, '📝 Tavsif kiriting (ixtiyoriy):', {
        reply_markup: {
          keyboard: [["O'tkazib yuborish"]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

    } else if (step === 'description') {
      if (text !== "O'tkazib yuborish") {
        state.data.description = { uz: text.trim() };
      }
      state.step = 'prep_time';
      await store.setProductCreate(chatId, state);
      await bot.sendMessage(chatId, '⏱️ Tayyorlanish vaqti (daqiqada, masalan: 15):', {
        reply_markup: {
          keyboard: [['10', '15', '20'], ['25', '30', '45']],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

    } else if (step === 'prep_time') {
      const time = parseInt(text);
      if (isNaN(time) || time <= 0) {
        await bot.sendMessage(chatId, '❌ Noto\'g\'ri vaqt. Raqam kiriting:');
        return;
      }
      state.data.preparationTime = time;
      state.step = 'photo';
      await store.setProductCreate(chatId, state);
      await bot.sendMessage(chatId, '📸 Mahsulot rasmini yuboring (ixtiyoriy):', {
        reply_markup: {
          keyboard: [["Rasmsiz qo'shish"]],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      });

    } else if (step === 'photo') {
      if (text === "Rasmsiz qo'shish" || text === "O'tkazib yuborish") {
        await completeProductCreation(bot, chatId, state, null);
      }
    }
  } catch (error) {
    logger.error('Error in product creation step:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
    await store.delProductCreate(chatId);
  }
};

// ─── Rasm handle ───────────────────────────────────────────────────────────
const handlePhotoMessage = async (bot, msg) => {
  const chatId = msg.chat.id;

  try {
    const createState = await store.getProductCreate(chatId);
    const editState = await store.getProductEdit(chatId);

    if (!createState && !editState) return;

    // Eng katta o'lchamdagi rasmni olish
    const photos = msg.photo;
    const photo = photos[photos.length - 1];
    const fileId = photo.file_id;

    // Fayl info
    const fileInfo = await bot.getFile(fileId);
    // Bot o'zining tokenini ishlatadi (getFileLink orqali)
    const fileUrl = await bot.getFileLink(fileId);

    await bot.sendMessage(chatId, '⏳ Rasm yuklanmoqda...');

    // Faylni yuklab olish
    const fileResp = await axios.get(fileUrl, { responseType: 'arraybuffer' });
    const ext = path.extname(fileInfo.file_path) || '.jpg';
    const tempDir = path.join(__dirname, '../../../uploads/temp');
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempPath = path.join(tempDir, `${fileId}${ext}`);
    fs.writeFileSync(tempPath, Buffer.from(fileResp.data));

    if (createState && createState.step === 'photo') {
      await completeProductCreation(bot, chatId, createState, tempPath);
    } else if (editState && editState.step === 'photo') {
      const formData = new FormData();
      formData.append('photo', fs.createReadStream(tempPath));
      await axios.post(`${API_URL}/products/${editState.productId}/photo`, formData, {
        headers: formData.getHeaders()
      });
      fs.unlinkSync(tempPath);
      await store.delProductEdit(chatId);
      await bot.sendMessage(chatId, '✅ Rasm yangilandi!');
    }
  } catch (error) {
    logger.error('Error handling photo:', error);
    await bot.sendMessage(chatId, '❌ Rasm yuklashda xatolik. Qaytadan urinib ko\'ring.');
    await store.delProductCreate(chatId);
    await store.delProductEdit(chatId);
  }
};

// ─── Mahsulot yaratishni yakunlash ─────────────────────────────────────────
const completeProductCreation = async (bot, chatId, state, photoPath) => {
  try {
    const productData = {
      vendor: state.vendorId,
      name: state.data.name,
      price: state.data.price,
      category: state.data.category || 'boshqa',
      preparationTime: state.data.preparationTime || 15,
    };
    if (state.data.description) productData.description = state.data.description;

    const resp = await axios.post(`${API_URL}/products`, productData);
    const product = resp.data.data.product;

    // Rasm yuklash
    if (photoPath && fs.existsSync(photoPath)) {
      try {
        const formData = new FormData();
        formData.append('photo', fs.createReadStream(photoPath));
        await axios.post(`${API_URL}/products/${product._id}/photo`, formData, {
          headers: formData.getHeaders()
        });
        fs.unlinkSync(photoPath);
      } catch (photoErr) {
        logger.warn('Photo upload error:', photoErr.message);
      }
    }

    await store.delProductCreate(chatId);

    const productName = product.name?.uz || product.name;
    const keyboard = {
      keyboard: [
        ['📋 Menyuni ko\'rish', '➕ Mahsulot qo\'shish'],
        ['📦 Buyurtmalar', '📊 Statistika'],
        ['👤 Profil', '⚙️ Sozlamalar']
      ],
      resize_keyboard: true
    };

    await bot.sendMessage(chatId,
      `✅ *${productName}* muvaffaqiyatli qo'shildi!\n\n💰 Narx: ${formatPrice(product.price)}`,
      { parse_mode: 'Markdown', reply_markup: keyboard }
    );
  } catch (error) {
    logger.error('Error completing product creation:', error);
    await store.delProductCreate(chatId);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// ─── Mahsulot tafsilotlari ────────────────────────────────────────────────
const showProductDetails = async (bot, chatId, productId) => {
  try {
    const response = await axios.get(`${API_URL}/products/${productId}`);
    const product = response.data.data.product;

    const productName = product.name?.uz || product.name;
    const productDesc = product.description?.uz || product.description || 'Tavsif yo\'q';

    let message = `🍽️ *${productName}*\n\n`;
    message += `📝 ${truncateText(productDesc, 200)}\n\n`;
    message += `💰 Narx: *${formatPrice(product.price)}*\n`;
    message += `🏷️ Kategoriya: ${product.category}\n`;
    message += `⏱️ Tayyorlash: ${product.preparationTime} daqiqa\n`;
    message += `🔄 Holat: ${product.isAvailable ? '✅ Faol' : '❌ Nofaol'}`;

    await bot.sendMessage(chatId, message, {
      parse_mode: 'Markdown',
      reply_markup: getProductActionKeyboard(productId, product.isAvailable, 'uz')
    });
  } catch (error) {
    logger.error('Error showing product details:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// ─── Mahsulot holati o'zgartirish ─────────────────────────────────────────
const toggleProduct = async (bot, chatId, messageId, productId) => {
  try {
    const response = await axios.put(`${API_URL}/products/${productId}/toggle`);
    const product = response.data.data.product;
    const productName = product.name?.uz || product.name;

    await bot.editMessageText(
      `${product.isAvailable ? '✅' : '❌'} *${productName}* — ${product.isAvailable ? 'Faol' : 'Nofaol'} qilindi`,
      {
        chat_id: chatId,
        message_id: messageId,
        parse_mode: 'Markdown',
        reply_markup: getProductActionKeyboard(productId, product.isAvailable, 'uz')
      }
    );
  } catch (error) {
    logger.error('Error toggling product:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// ─── Mahsulot o'chirish ────────────────────────────────────────────────────
const deleteProduct = async (bot, chatId, messageId, productId, vendorId) => {
  try {
    await axios.delete(`${API_URL}/products/${productId}`);
    await bot.editMessageText('🗑️ Mahsulot o\'chirildi', {
      chat_id: chatId,
      message_id: messageId
    });
    setTimeout(() => showMenu(bot, chatId, vendorId), 1000);
  } catch (error) {
    logger.error('Error deleting product:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

// ─── Edit step (stub) ──────────────────────────────────────────────────────
const handleProductEditStep = async (bot, msg, state) => {
  // TODO: edit flow
};

const handleDocumentMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  if (msg.document?.mime_type?.startsWith('image/')) {
    const photoMsg = { ...msg, photo: [{ file_id: msg.document.file_id }] };
    await handlePhotoMessage(bot, photoMsg);
  } else {
    await bot.sendMessage(chatId, '❌ Faqat rasm fayllari qabul qilinadi (JPG, PNG)');
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
