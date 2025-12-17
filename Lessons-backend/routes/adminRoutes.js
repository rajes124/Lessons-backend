const express = require('express');
const verifyToken = require('../middleware/verifyToken');
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllLessons,
  featureLesson,
  deleteLessonAdmin,
  getReportedLessons,
  ignoreReportedLesson
} = require('../controllers/adminController');

const router = express.Router();

// Only Admin Middleware
const adminOnly = async (req, res, next) => {
  const user = req.user;
  const { MongoClient } = require('mongodb');
  const client = new MongoClient(process.env.MONGO_URI);
  try {
    await client.connect();
    const db = client.db(process.env.DB_NAME || 'LessonsDB');
    const usersCollection = db.collection('users');
    const currentUser = await usersCollection.findOne({ firebaseUid: user.uid });
    if (!currentUser || currentUser.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }
    next();
  } finally {
    await client.close();
  }
};

// Users
router.get('/users', verifyToken, adminOnly, getAllUsers);
router.put('/users/:id/role', verifyToken, adminOnly, updateUserRole);
router.delete('/users/:id', verifyToken, adminOnly, deleteUser);

// Lessons
router.get('/lessons', verifyToken, adminOnly, getAllLessons);
router.put('/lessons/:id/feature', verifyToken, adminOnly, featureLesson);
router.delete('/lessons/:id', verifyToken, adminOnly, deleteLessonAdmin);

// Reported Lessons
router.get('/reported-lessons', verifyToken, adminOnly, getReportedLessons);
router.put('/reported-lessons/:id/ignore', verifyToken, adminOnly, ignoreReportedLesson);

module.exports = router;
