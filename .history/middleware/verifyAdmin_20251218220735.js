// middleware/verifyAdmin.js
const admin = require('firebase-admin');

// Middleware to check if user is admin
const verifyAdmin = async (req, res, next) => {
  const uid = req.user?.uid;
  if (!uid) return res.status(401).json({ message: 'Unauthorized' });

  try {
    // এখানে ধরে নিচ্ছি আপনার DB এ users collection আছে যেখানে role আছে
    const { MongoClient } = require('mongodb');
    const client = new MongoClient(process.env.MONGO_URI);
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'LessonsDB');
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ firebaseUid: uid });
    await client.close();

    if (!user || user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    next();
  } catch (err) {
    console.error("verifyAdmin error:", err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

module.exports = verifyAdmin;
