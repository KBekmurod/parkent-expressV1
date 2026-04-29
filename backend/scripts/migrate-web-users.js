/**
 * Migration: eski web foydalanuvchilarni yangi `webPhone` formatiga o'tkazish
 *
 * Eski format: telegramId: 'web_+998901234567', authType yo'q
 * Yangi format: webPhone: '+998901234567', telegramId: undefined, authType: 'web'
 *
 * Ishga tushirish:
 *   node scripts/migrate-web-users.js
 */
require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../src/models/User.model');

const migrate = async () => {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('✅ MongoDB ulandi');

  const oldWebUsers = await User.find({
    telegramId: { $regex: /^web_/ }
  });

  console.log(`Topildi: ${oldWebUsers.length} ta eski web foydalanuvchi`);

  let migrated = 0;
  for (const user of oldWebUsers) {
    const phone = user.telegramId.replace(/^web_/, '');
    user.webPhone = phone;
    user.phone = phone;
    user.telegramId = undefined;
    user.authType = 'web';

    try {
      await user.save();
      migrated++;
      console.log(`✓ ${phone}`);
    } catch (err) {
      console.error(`✗ ${phone}: ${err.message}`);
    }
  }

  console.log(`\n✅ ${migrated}/${oldWebUsers.length} foydalanuvchi muvaffaqiyatli o'zgartirildi`);
  await mongoose.disconnect();
};

migrate().catch(err => {
  console.error('Migration xatosi:', err);
  process.exit(1);
});
