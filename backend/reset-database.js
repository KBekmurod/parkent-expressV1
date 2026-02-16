require('dotenv').config();
const mongoose = require('mongoose');

async function reset() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ MongoDB connected');

    // HAMMA userlarni o'chirish
    const users = await mongoose.connection.db.collection('users').deleteMany({});
    console.log(`✅ Deleted ${users.deletedCount} users`);
    
    // Boshqa collectionlar ham bo'lsa (ixtiyoriy)
    const orders = await mongoose.connection.db.collection('orders').deleteMany({});
    console.log(`✅ Deleted ${orders.deletedCount} orders`);
    
    console.log('✅ Database reset complete!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

reset();

