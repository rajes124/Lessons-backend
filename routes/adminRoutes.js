<<<<<<< HEAD
// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
=======
const express = require('express');
const verifyToken = require('../middleware/verifyToken');
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllLessons,
  featureLesson,
  deleteLessonAdmin,
  getReportedLessons,
  ignoreReportedLesson
<<<<<<< HEAD
} = require("../controllers/adminController");

const verifyToken = require("../middleware/verifyToken");
const connectDB = require("../config/db"); // 🔥 শুধু এটুকু add

// Admin check middleware
const adminOnly = async (req, res, next) => {
  try {
    const db = await connectDB(); // 🔥 add
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({
      firebaseUid: req.user.uid,
    });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Users
<<<<<<< HEAD
router.get("/users", verifyToken, adminOnly, getAllUsers);
router.put("/users/:id/role", verifyToken, adminOnly, updateUserRole);
router.delete("/users/:id", verifyToken, adminOnly, deleteUser);

// Lessons
router.get("/lessons", verifyToken, adminOnly, getAllLessons);
router.put("/lessons/:id/feature", verifyToken, adminOnly, featureLesson);
router.delete("/lessons/:id", verifyToken, adminOnly, deleteLessonAdmin);

// Reported Lessons
router.get("/reported-lessons", verifyToken, adminOnly, getReportedLessons);
router.put("/reported-lessons/:id/ignore", verifyToken, adminOnly, ignoreReportedLesson);
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680

module.exports = router;
