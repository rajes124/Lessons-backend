<<<<<<< HEAD
// backend/config/db.js
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?retryWrites=true&w=majority`;

let client;
let dbConnection;

const connectDB = async () => {
  if (dbConnection) {
    return dbConnection; // Already connected, return existing
  }

  try {
    client = new MongoClient(uri, {
      serverApi: {
        version: "1",
        strict: true,
        deprecationErrors: true,
      },
    });

    await client.connect();
    console.log("✅ MongoDB Connected Successfully via config/db");

    dbConnection = client.db(process.env.DB_NAME || "studentLifeDB"); // আপনার DB নাম
    return dbConnection;
  } catch (error) {
    console.error("❌ MongoDB Connection Failed in config/db:", error.message);
    throw error; // যাতে কন্ট্রোলারে catch করতে পারে
  }
};

// Optional: Graceful shutdown (ভালো প্র্যাকটিস)
process.on("SIGINT", async () => {
  if (client) {
    await client.close();
    console.log("MongoDB connection closed.");
    process.exit(0);
  }
});

module.exports = connectDB;
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
