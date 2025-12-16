// backend/routes/users.js

const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "LessonsDB";

// GET user by firebaseUid (AuthContext থেকে call হবে)
router.get("/users/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // MongoDB _id বাদ দিয়ে বাকি data পাঠাও
    const { _id, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
});

// PUT update user profile (name, photoURL)
router.put("/users/:uid", verifyToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, photoURL } = req.body;

    // Security check – শুধু নিজের profile update করতে পারবে
    if (req.user.uid !== uid) {
      return res.status(403).json({ message: "Not authorized to update this profile" });
    }

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { firebaseUid: uid },
      {
        $set: {
          name: name || null,
          photoURL: photoURL || null,
          updatedAt: new Date(),
        },
      }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "Profile updated successfully in MongoDB" });
  } catch (error) {
    console.error("Update profile error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
});

module.exports = router; 