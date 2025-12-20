// backend/routes/userRoutes.js

const express = require("express");
const router = express.Router();
const { getUserByUid, createUser, updateUserProfile } = require("../controllers/userController");
const verifyToken = require("../middleware/verifyToken");

// GET user by uid (load userData in AuthContext)
router.get("/:uid", getUserByUid);

// POST create new user (first login – if not exists)
router.post("/create", createUser);

// PUT update profile (protected – token needed)
router.put("/:uid", verifyToken, updateUserProfile);

module.exports = router;