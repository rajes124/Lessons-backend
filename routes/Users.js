const express = require("express");
const router = express.Router();
const { MongoClient } = require("mongodb");
const verifyToken = require("../middleware/verifyToken");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "LessonsDB";


router.get("/:uid", async (req, res) => {
  try {
    const { uid } = req.params;

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ firebaseUid: uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { _id, ...userData } = user;
    res.json(userData);
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
});


   
router.post("/create", async (req, res) => {
  try {
    const { firebaseUid, name, email, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res
        .status(400)
        .json({ message: "firebaseUid and email required" });
    }

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    
    const existing = await usersCollection.findOne({ firebaseUid });
    if (existing) {
      return res.json({
        message: "User already exists",
        user: existing,
      });
    }

    const newUser = {
      firebaseUid,
      name: name || "User",
      email,
      photoURL: photoURL || null,
      isPremium: false,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    res.status(201).json({
      message: "User created successfully",
      userId: result.insertedId,
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
});

/* =========================
   UPDATE user profile
   ========================= */
router.put("/:uid", verifyToken, async (req, res) => {
  try {
    const { uid } = req.params;
    const { name, photoURL } = req.body;

  
    if (req.user.uid !== uid) {
      return res
        .status(403)
        .json({ message: "Not authorized to update this profile" });
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
