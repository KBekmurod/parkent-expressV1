const axios = require('axios');
const { getMainMenuKeyboard, getCategoryKeyboard } = require('../keyboards/mainMenu');
const { MESSAGES } = require('../utils/messages');
const { isValidWorkingHours, parseWorkingHours, getVendorStatusText } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store registration states globally (in production, use Redis)
if (!global.vendorRegistrations) {
  global.vendorRegistrations = new Map();
}

/**
 * Handle /start command
 */
const handleStart = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const telegramId = msg.from.id.toString();
  const firstName = msg.from.first_name || '';
  const lastName = msg.from.last_name || '';
  const username = msg.from.username || '';

  try {
    // Check if vendor exists
    try {
      const response = await axios.get(`${API_URL}/vendors/telegram/${telegramId}`);
      const vendor = response.data.data.vendor;

      // Check vendor status
      if (vendor.status === 'pending') {
        await bot.sendMessage(chatId, MESSAGES.uz.registrationPending);
        return;
      } else if (vendor.status === 'blocked') {
        await bot.sendMessage(chatId, MESSAGES.uz.accountBlocked);
        return;
      } else if (vendor.status === 'closed') {
        await bot.sendMessage(chatId, MESSAGES.uz.accountClosed);
        return;
      }

      // Welcome back active vendor
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.welcomeBack(firstName),
        {
          reply_markup: getMainMenuKeyboard('uz'),
          parse_mode: 'Markdown'
        }
      );
      
      logger.info(`Vendor ${telegramId} logged in`);
    } catch (error) {
      if (error.response?.status === 404) {
        // Vendor not found, start registration
        await bot.sendMessage(
          chatId,
          MESSAGES.uz.welcome(firstName),
          { parse_mode: 'Markdown' }
        );
        
        await bot.sendMessage(chatId, MESSAGES.uz.notRegistered);
        
        // Request phone number
        await bot.sendMessage(
          chatId,
          MESSAGES.uz.requestPhone,
          {
            reply_markup: {
              keyboard: [
                [{ text: '📱 Telefon raqamni yuborish', request_contact: true }]
              ],
              resize_keyboard: true,
              one_time_keyboard: true
            }
          }
        );

        // Initialize registration state
        global.vendorRegistrations.set(chatId, {
          telegramId,
          firstName,
          lastName,
          username,
          step: 'phone'
        });
      } else {
        throw error;
      }
    }
  } catch (error) {
    logger.error('Error in start handler:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle contact (phone number)
 */
const handleContact = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const phone = msg.contact.phone_number;
  const registrationState = global.vendorRegistrations.get(chatId);

  if (!registrationState || registrationState.step !== 'phone') {
    return;
  }

  try {
    registrationState.phone = phone;
    registrationState.step = 'location';
    global.vendorRegistrations.set(chatId, registrationState);

    await bot.sendMessage(chatId, MESSAGES.uz.phoneReceived);
    
    // Request location
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.requestLocation,
      {
        reply_markup: {
          keyboard: [
            [{ text: '📍 Joylashuvni yuborish', request_location: true }]
          ],
          resize_keyboard: true,
          one_time_keyboard: true
        }
      }
    );

    logger.info(`Vendor registration: Phone received for ${chatId}`);
  } catch (error) {
    logger.error('Error handling contact:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle location message
 */
const handleLocationMessage = async (bot, msg) => {
  const chatId = msg.chat.id;
  const location = msg.location;
  const registrationState = global.vendorRegistrations.get(chatId);

  if (!registrationState || registrationState.step !== 'location') {
    return;
  }

  try {
    registrationState.location = {
      lat: location.latitude,
      lng: location.longitude
    };
    registrationState.step = 'name';
    global.vendorRegistrations.set(chatId, registrationState);

    await bot.sendMessage(chatId, MESSAGES.uz.locationReceived);
    
    // Request business name
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.requestBusinessName,
      {
        reply_markup: { remove_keyboard: true }
      }
    );

    logger.info(`Vendor registration: Location received for ${chatId}`);
  } catch (error) {
    logger.error('Error handling location:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle text messages during registration
 */
const handleTextMessage = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;
  const registrationState = global.vendorRegistrations.get(chatId);

  if (!registrationState) {
    return;
  }

  try {
    const step = registrationState.step;

    if (step === 'name') {
      // Save business name
      registrationState.name = text.trim();
      registrationState.step = 'category';
      global.vendorRegistrations.set(chatId, registrationState);

      // Request category
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.requestCategory,
        {
          reply_markup: getCategoryKeyboard('uz')
        }
      );
    } else if (step === 'category') {
      // Save category (remove emoji)
      const category = text.replace(/[^\w\s-]/gi, '').trim();
      registrationState.category = category;
      registrationState.step = 'description';
      global.vendorRegistrations.set(chatId, registrationState);

      // Request description
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.requestDescription,
        {
          reply_markup: {
            keyboard: [
              [{ text: 'O\'tkazib yuborish' }]
            ],
            resize_keyboard: true,
            one_time_keyboard: true
          },
          parse_mode: 'Markdown'
        }
      );
    } else if (step === 'description') {
      // Save description (optional)
      if (text !== 'O\'tkazib yuborish' && text !== 'Пропустить') {
        registrationState.description = text.trim();
      }
      registrationState.step = 'workingHours';
      global.vendorRegistrations.set(chatId, registrationState);

      // Request working hours
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.requestWorkingHours,
        {
          reply_markup: { remove_keyboard: true }
        }
      );
    } else if (step === 'workingHours') {
      // Validate and save working hours
      if (!isValidWorkingHours(text.trim())) {
        await bot.sendMessage(chatId, MESSAGES.uz.invalidWorkingHours);
        return;
      }

      const workingHours = parseWorkingHours(text.trim());
      registrationState.workingHours = workingHours;
      
      // Complete registration
      await completeRegistration(bot, chatId, registrationState);
    }
  } catch (error) {
    logger.error('Error handling text message:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Complete vendor registration
 */
const completeRegistration = async (bot, chatId, registrationData) => {
  try {
    // Get address from reverse geocoding or use placeholder
    const address = 'Parkent, Toshkent viloyati'; // In production, use geocoding API

    // Register vendor
    const response = await axios.post(`${API_URL}/vendors/register`, {
      telegramId: registrationData.telegramId,
      name: registrationData.name,
      description: registrationData.description || '',
      category: registrationData.category,
      phone: registrationData.phone,
      location: registrationData.location,
      address,
      workingHours: registrationData.workingHours
    });

    // Clear registration state
    global.vendorRegistrations.delete(chatId);

    // Send confirmation
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.registrationComplete,
      { parse_mode: 'Markdown' }
    );

    logger.info(`Vendor registered successfully: ${registrationData.name}`);
  } catch (error) {
    logger.error('Error completing registration:', error);
    
    let errorMessage = MESSAGES.uz.error;
    if (error.response?.data?.message) {
      errorMessage += `\n\n${error.response.data.message}`;
    }
    
    await bot.sendMessage(chatId, errorMessage);
    
    // Clear registration state on error
    global.vendorRegistrations.delete(chatId);
  }
};

module.exports = {
  handleStart,
  handleContact,
  handleLocationMessage,
  handleTextMessage
};
