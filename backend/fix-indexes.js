require('dotenv').config();
const mongoose = require('mongoose');

async function fixIndexes() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // Users kolleksiyasidagi barcha indekslarni o'chiramiz
    await mongoose.connection.db.collection('users').dropIndexes();
    console.log('✅ Old indexes dropped');

    // Modelni chaqirib, indekslarni qayta quramiz
    require('./src/models/User.model');
    await mongoose.model('User').syncIndexes();

    console.log('✅ New indexes built with "sparse: true"');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}
fixIndexes();

