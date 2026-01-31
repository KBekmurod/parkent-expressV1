const TelegramBot = require('node-telegram-bot-api');

// Bot tokens (agar ENV'da bo'lsa)
const CUSTOMER_BOT_TOKEN = process.env.CUSTOMER_BOT_TOKEN || '';
const DRIVER_BOT_TOKEN = process.env.DRIVER_BOT_TOKEN || '';
const VENDOR_BOT_TOKEN = process.env.VENDOR_BOT_TOKEN || '';

// Bot instances (keyinroq ishlatamiz)
let customerBot = null;
let driverBot = null;
let vendorBot = null;

if (CUSTOMER_BOT_TOKEN) {
  customerBot = new TelegramBot(CUSTOMER_BOT_TOKEN, { polling: false });
}

if (DRIVER_BOT_TOKEN) {
  driverBot = new TelegramBot(DRIVER_BOT_TOKEN, { polling: false });
}

if (VENDOR_BOT_TOKEN) {
  vendorBot = new TelegramBot(VENDOR_BOT_TOKEN, { polling: false });
}

module.exports = {
  customerBot,
  driverBot,
  vendorBot,
  CUSTOMER_BOT_TOKEN,
  DRIVER_BOT_TOKEN,
  VENDOR_BOT_TOKEN
};
