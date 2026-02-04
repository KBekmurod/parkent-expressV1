const cron = require('node-cron');
const Driver = require('../models/Driver.model');
const { getDriverPendingSettlement } = require('../services/settlement.service');
const logger = require('../utils/logger');

let driverBot;

const initializeBot = (bot) => {
  driverBot = bot;
};

const startSettlementReminder = () => {
  // Run every day at 22:00 (10:00 PM)
  cron.schedule('0 22 * * *', async () => {
    logger.info('Running settlement reminder job...');
    
    try {
      const drivers = await Driver.find({ status: 'active' });

      for (const driver of drivers) {
        if (!driver.telegramId) continue;

        const pending = await getDriverPendingSettlement(driver._id);

        if (pending.totalAmount > 0) {
          await driverBot.sendMessage(driver.telegramId,
            `⏰ ESLATMA!\n\nBugun ${pending.totalAmount.toLocaleString()} so'm yig'dingiz.\nErtaga qaytaring!`,
            { parse_mode: 'Markdown' }
          );
          logger.info(`Settlement reminder sent to driver ${driver._id}`);
        }
      }
    } catch (error) {
      logger.error('Error in settlement reminder job:', error);
    }
  }, {
    timezone: "Asia/Tashkent"
  });
  
  logger.info('Settlement reminder job scheduled for 22:00 daily');
};

module.exports = { initializeBot, startSettlementReminder };
