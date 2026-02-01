const axios = require('axios');
const { getMainMenuKeyboard, getVehicleTypeKeyboard } = require('../keyboards/mainMenu');
const { MESSAGES } = require('../utils/messages');
const { validatePhoneNumber, validatePlateNumber } = require('../utils/helpers');
const logger = require('../../../utils/logger');

const API_URL = process.env.API_URL || 'http://localhost:5000/api/v1';

// Store registration states globally (in production, use Redis)
if (!global.driverRegistrations) {
  global.driverRegistrations = new Map();
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
    // Check if driver exists
    try {
      const response = await axios.get(`${API_URL}/drivers/telegram/${telegramId}`);
      const driver = response.data.data.driver;

      // Check driver status
      if (driver.status === 'pending') {
        await bot.sendMessage(chatId, MESSAGES.uz.registrationPending);
        return;
      } else if (driver.status === 'blocked') {
        await bot.sendMessage(chatId, MESSAGES.uz.accountBlocked);
        return;
      } else if (driver.status === 'closed') {
        await bot.sendMessage(chatId, MESSAGES.uz.accountClosed);
        return;
      }

      // Welcome back active driver
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.welcomeBack(firstName),
        {
          reply_markup: getMainMenuKeyboard(driver.isOnline, 'uz'),
          parse_mode: 'Markdown'
        }
      );
      
      logger.info(`Driver ${telegramId} logged in`);
    } catch (error) {
      if (error.response?.status === 404) {
        // Driver not found, start registration
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
        global.driverRegistrations.set(chatId, {
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

  try {
    const regState = global.driverRegistrations.get(chatId);
    
    if (!regState || regState.step !== 'phone') {
      return;
    }

    if (!validatePhoneNumber(phone)) {
      await bot.sendMessage(chatId, '❌ Telefon raqami noto\'g\'ri. Qaytadan yuboring.');
      return;
    }

    // Update registration state
    regState.phone = phone;
    regState.step = 'vehicleType';
    global.driverRegistrations.set(chatId, regState);

    // Request vehicle type
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.phoneReceived + '\n\n' + MESSAGES.uz.requestVehicleType,
      {
        reply_markup: getVehicleTypeKeyboard('uz')
      }
    );

    logger.info(`Driver ${regState.telegramId} phone received: ${phone}`);
  } catch (error) {
    logger.error('Error handling contact:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle vehicle type selection
 */
const handleVehicleTypeCallback = async (bot, callbackQuery) => {
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const vehicleType = callbackQuery.data.split(':')[1];

  try {
    const regState = global.driverRegistrations.get(chatId);
    
    if (!regState || regState.step !== 'vehicleType') {
      await bot.answerCallbackQuery(callbackQuery.id, { text: '❌ Xatolik yuz berdi' });
      return;
    }

    // Update registration state
    regState.vehicleType = vehicleType;
    regState.step = 'vehicleModel';
    global.driverRegistrations.set(chatId, regState);

    // Delete previous message
    await bot.deleteMessage(chatId, messageId);

    // Request vehicle model
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.requestVehicleModel,
      {
        reply_markup: {
          force_reply: true
        }
      }
    );

    await bot.answerCallbackQuery(callbackQuery.id);
    logger.info(`Driver ${regState.telegramId} vehicle type selected: ${vehicleType}`);
  } catch (error) {
    logger.error('Error handling vehicle type:', error);
    await bot.answerCallbackQuery(callbackQuery.id, { text: MESSAGES.uz.error });
  }
};

/**
 * Handle text messages during registration
 */
const handleTextMessage = (bot) => async (msg) => {
  const chatId = msg.chat.id;
  const text = msg.text;

  try {
    const regState = global.driverRegistrations.get(chatId);
    
    if (!regState) {
      return;
    }

    if (regState.step === 'vehicleModel') {
      // Save vehicle model
      regState.vehicleModel = text.trim();
      regState.step = 'plateNumber';
      global.driverRegistrations.set(chatId, regState);

      await bot.sendMessage(
        chatId,
        MESSAGES.uz.requestPlateNumber,
        {
          reply_markup: {
            force_reply: true
          }
        }
      );
    } else if (regState.step === 'plateNumber') {
      // Save plate number
      if (!validatePlateNumber(text)) {
        await bot.sendMessage(chatId, '❌ Avtomobil raqami noto\'g\'ri. Qaytadan kiriting.');
        return;
      }

      regState.plateNumber = text.trim().toUpperCase();
      regState.step = 'licensePhoto';
      global.driverRegistrations.set(chatId, regState);

      await bot.sendMessage(chatId, MESSAGES.uz.requestLicensePhoto);
    } else if (regState.step === 'customRejectionReason') {
      // This will be handled in orders handler
      return;
    }

    logger.info(`Driver ${regState.telegramId} registration step: ${regState.step}`);
  } catch (error) {
    logger.error('Error handling text message:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Handle photo messages during registration
 */
const handlePhotoMessage = async (bot, msg) => {
  const chatId = msg.chat.id;

  try {
    const regState = global.driverRegistrations.get(chatId);
    
    if (!regState) {
      return;
    }

    if (regState.step === 'licensePhoto') {
      // Save license photo file_id
      const photo = msg.photo[msg.photo.length - 1]; // Get highest resolution
      regState.licensePhoto = photo.file_id;
      regState.step = 'vehiclePhoto';
      global.driverRegistrations.set(chatId, regState);

      await bot.sendMessage(chatId, MESSAGES.uz.requestVehiclePhoto);
      logger.info(`Driver ${regState.telegramId} license photo received`);
    } else if (regState.step === 'vehiclePhoto') {
      // Save vehicle photo file_id
      const photo = msg.photo[msg.photo.length - 1];
      regState.vehiclePhoto = photo.file_id;
      
      // Complete registration - submit to backend
      await completeRegistration(bot, chatId, regState);
    }
  } catch (error) {
    logger.error('Error handling photo message:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Complete registration and submit to backend
 */
const completeRegistration = async (bot, chatId, regState) => {
  try {
    // Create driver in database
    const driverData = {
      telegramId: regState.telegramId,
      firstName: regState.firstName,
      lastName: regState.lastName,
      username: regState.username,
      phone: regState.phone,
      vehicleType: regState.vehicleType,
      vehicleModel: regState.vehicleModel,
      plateNumber: regState.plateNumber,
      licensePhoto: regState.licensePhoto,
      vehiclePhoto: regState.vehiclePhoto,
      status: 'pending'
    };

    await axios.post(`${API_URL}/drivers/register`, driverData);

    // Clear registration state
    global.driverRegistrations.delete(chatId);

    // Send confirmation
    await bot.sendMessage(
      chatId,
      MESSAGES.uz.registrationComplete,
      {
        reply_markup: {
          remove_keyboard: true
        }
      }
    );

    logger.info(`Driver ${regState.telegramId} registration completed`);
  } catch (error) {
    logger.error('Error completing registration:', error);
    await bot.sendMessage(chatId, MESSAGES.uz.error);
  }
};

/**
 * Notify driver of registration approval
 */
const notifyApproval = async (bot, telegramId, approved, reason = null) => {
  try {
    const chatId = parseInt(telegramId);
    
    if (approved) {
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.registrationApproved,
        {
          reply_markup: getMainMenuKeyboard(false, 'uz')
        }
      );
    } else {
      await bot.sendMessage(
        chatId,
        MESSAGES.uz.registrationRejected(reason || 'Noma\'lum sabab')
      );
    }
  } catch (error) {
    logger.error('Error notifying driver approval:', error);
  }
};

module.exports = {
  handleStart,
  handleContact,
  handleVehicleTypeCallback,
  handleTextMessage,
  handlePhotoMessage,
  notifyApproval
};
