// backend/controllers/userController.js

<<<<<<< HEAD
const connectDB = require("../config/db"); 

// GET user by firebaseUid
exports.getUserByUid = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ firebaseUid: req.params.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }


    const { _id, ...userData } = user;
    console.log("🔵 Sending userData to frontend:", userData);
    res.json(userData);
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};


exports.createUser = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { firebaseUid, name, email, photoURL } = req.body;

    // Validation

const { MongoClient } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "LessonsDB";

// Create or Update User (Firebase Auth থেকে call করবে)
const createOrUpdateUser = async (req, res) => {
  try {
    const { firebaseUid, name, email, photoURL } = req.body;


    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "firebaseUid and email are required" });
    }


   
    const existingUser = await usersCollection.findOne({ firebaseUid });
    if (existingUser) {
      const { _id, ...userData } = existingUser;
      console.log("🟢 User already exists, returning data:", userData);
      return res.status(200).json(userData); 
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");


    const existingUser = await usersCollection.findOne({ firebaseUid });

    if (existingUser) {
      // Update existing user
      await usersCollection.updateOne(
        { firebaseUid },
        {
          $set: {
            name: name || existingUser.name,
            photoURL: photoURL || existingUser.photoURL,
            updatedAt: new Date(),
          },
        }
      );
      return res.json({ message: "User updated", user: existingUser });

    }

    // Create new user
    const newUser = {
      firebaseUid,

      name: name || "Anonymous User",
      email,
      photoURL: photoURL || null,
      isPremium: false,
      role: "user",                    // নতুন ইউজার → user role

      name: name || "User",
      email,
      photoURL: photoURL || null,
      isPremium: false,
      role: "user",

      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);

    console.log("🟢 New user created with ID:", result.insertedId);

    // Return created user (without MongoDB _id)
    const createdUser = {
      firebaseUid: newUser.firebaseUid,
      name: newUser.name,
      email: newUser.email,
      photoURL: newUser.photoURL,
      isPremium: newUser.isPremium,
      role: newUser.role,
      createdAt: newUser.createdAt,
      updatedAt: newUser.updatedAt,
    };

    res.status(201).json(createdUser);
  } catch (error) {
    console.error("❌ Create user error:", error);
    res.status(500).json({ message: "Failed to create user" });
  }
};

// UPDATE user profile (name/photo change)
exports.updateUserProfile = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { name, photoURL } = req.body;
    const uid = req.params.uid;

    if (!name && photoURL === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updateFields = {
      updatedAt: new Date(),
    };
    if (name) updateFields.name = name;
    if (photoURL !== undefined) updateFields.photoURL = photoURL;

    const result = await usersCollection.updateOne(
      { firebaseUid: uid },
      { $set: updateFields }

    res.status(201).json({ message: "User created successfully", userId: result.insertedId });
  } catch (error) {
    console.error("User creation error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    await client.close();
  }
};

// Get User by firebaseUid (for frontend use)
const getUserByUid = async (req, res) => {
  try {
    const { firebaseUid } = req.params;

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ firebaseUid });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// Update User Role (Admin only)
const updateUserRole = async (req, res) => {
  try {
    const { firebaseUid } = req.params;
    const { role } = req.body; // "user" or "admin"

    if (!["user", "admin"].includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { firebaseUid },
      { $set: { role, updatedAt: new Date() } }

    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }


    console.log("🟢 Profile updated for UID:", uid);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }

    res.json({ message: "User role updated successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// Make User Premium (Stripe webhook থেকে call করবে)
const makeUserPremium = async (firebaseUid) => {
  try {
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");

    await usersCollection.updateOne(
      { firebaseUid },
      { $set: { isPremium: true, updatedAt: new Date() } }
    );

    console.log(`User ${firebaseUid} upgraded to Premium`);
  } catch (error) {
    console.error("Premium upgrade error:", error);
  } finally {
    await client.close();
  }
};

module.exports = {
  createOrUpdateUser,
  getUserByUid,
  updateUserRole,
  makeUserPremium,

};