/**
 * fix-telegram-index.js
 * 
 * Muammo: telegramId unique index da null qiymatlar duplikat hisoblanadi
 * (MongoDB 4.x da sparse index null larni o'tkazib yuboradi, lekin
 *  eski yaratilgan indeks sparse bo'lmasligi mumkin)
 * 
 * Ishlatish: node fix-telegram-index.js
 */

require('dotenv').config();
const mongoose = require('mongoose');

async function fixTelegramIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/parkent-express');
    console.log('✅ MongoDB ga ulandi');

    const db = mongoose.connection.db;
    const collection = db.collection('users');

    // Mavjud indekslarni ko'rish
    const indexes = await collection.indexes();
    console.log('📋 Mavjud indekslar:');
    indexes.forEach(idx => {
      if (idx.key.telegramId !== undefined) {
        console.log('  telegramId index:', JSON.stringify(idx));
      }
    });

    // Eski telegramId indeksini o'chirish
    try {
      await collection.dropIndex('telegramId_1');
      console.log('🗑️  Eski telegramId_1 indeksi o\'chirildi');
    } catch (e) {
      console.log('ℹ️  telegramId_1 indeksi topilmadi yoki allaqachon yo\'q');
    }

    // Yangi to'g'ri sparse index yaratish
    await collection.createIndex(
      { telegramId: 1 },
      { unique: true, sparse: true, name: 'telegramId_1' }
    );
    console.log('✅ Yangi sparse unique indeks yaratildi: telegramId');

    // webPhone ham tekshirish
    try {
      await collection.dropIndex('webPhone_1');
      console.log('🗑️  Eski webPhone_1 indeksi o\'chirildi');
    } catch (e) {
      console.log('ℹ️  webPhone_1 indeksi topilmadi');
    }

    await collection.createIndex(
      { webPhone: 1 },
      { unique: true, sparse: true, name: 'webPhone_1' }
    );
    console.log('✅ Yangi sparse unique indeks yaratildi: webPhone');

    // Natijani ko'rsatish
    const newIndexes = await collection.indexes();
    console.log('\n📋 Yangilangan indekslar:');
    newIndexes.forEach(idx => console.log(' ', JSON.stringify(idx.key), '→', idx.name));

    console.log('\n✅ Tayyor! Endi ro\'yxatdan o\'tish ishlashi kerak.');
    process.exit(0);
  } catch (err) {
    console.error('❌ Xatolik:', err.message);
    process.exit(1);
  }
}

fixTelegramIndex();
