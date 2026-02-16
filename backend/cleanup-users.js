require('dotenv').config();
const mongoose = require('mongoose');

async function cleanup() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB connected');

    // Bo'sh phone li userlarni o'chirish
    const result = await mongoose.connection.db.collection('users').deleteMany({ 
      phone: { $in: ["", null] } 
    });
    
    console.log(`Deleted ${result.deletedCount} users with empty phone`);
    
    // Yoki HAMMA userlarni o'chirish (yangi boshlash)
    // const result = await mongoose.connection.db.collection('users').deleteMany({});
    // console.log(`Deleted ALL ${result.deletedCount} users`);
    
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

cleanup();
