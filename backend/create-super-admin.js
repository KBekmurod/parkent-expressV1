require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

async function createAdmin() {
  try {
    // 1. Ulanish
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // 2. Modelni chaqirish
    const User = require('./src/models/User.model');

    // 3. Admin ma'lumotlari
    const email = 'admin@parkent.uz';
    const password = '123'; 
    
    // 4. Parolni shifrlash
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 5. Yangi admin obyektini yaratish
    const admin = new User({
      firstName: 'Super',
      lastName: 'Admin',
      phone: '+998900000000', 
      email: email,
      password: hashedPassword,
      role: 'admin', 
      status: 'active',
      // MUHIM TUZATISH: Fake telegram ID qo'shdik
      telegramId: 'admin_console_001' 
    });

    // 6. Saqlash
    await admin.save();
    console.log(`🎉 Muvaffaqiyatli! Admin yaratildi.\nLogin: ${email}\nParol: ${password}`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

createAdmin();
