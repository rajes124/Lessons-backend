// server/config/dbConnect.js (বা যেখানে রাখো)

const mongoose = require('mongoose');

const dbConnect = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI); // অপশনগুলো আর লাগবে না

    console.log('✅ MongoDB Connected Successfully');

    // Optional: Connection events (ভালো practice)
    mongoose.connection.on('disconnected', () => {
      console.warn('⚠️ MongoDB Disconnected');
    });

    mongoose.connection.on('error', (err) => {
      console.error('MongoDB Connection Error:', err);
    });

  } catch (error) {
    console.error('❌ MongoDB Connection Failed:', error.message);
    process.exit(1); // server বন্ধ করে দাও
  }
};

module.exports = dbConnect;