// backend/routes/adminRoutes.js

const express = require("express");
const router = express.Router();
const {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllLessons,
  featureLesson,
  deleteLessonAdmin,
  getReportedLessons,
  ignoreReportedLesson
} = require("../controllers/adminController");
const verifyToken = require("../middleware/verifyToken");

// 🔥 এই দুইটা import করলাম index.js থেকে
const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "studentLifeDB";
// Admin check middleware
const adminOnly = async (req, res, next) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ firebaseUid: req.user.uid });

    if (!user || user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({ message: "Server error" });
  } finally {
    await client.close();
  }
};

// Users
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

module.exports = router;