// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { 
  getUserByUid, 
  createOrUpdateUser,   // এটাই আপনার আসল ফাংশন
  updateUserProfile 
} = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

// GET user by uid (load userData in AuthContext)
router.get("/:uid", getUserByUid);

// POST create or update user (first login বা existing user হলে update)
router.post("/create", createOrUpdateUser);

// PUT update profile (protected – token needed)
router.put("/:uid", verifyToken, updateUserProfile);

module.exports = router;