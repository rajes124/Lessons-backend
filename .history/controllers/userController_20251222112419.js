// backend/controllers/userController.js

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

    // MongoDB _id বাদ দিয়ে বাকিটা পাঠাও
    const { _id, ...userData } = user;
    console.log("🔵 Sending userData to frontend:", userData);
    res.json(userData);
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

// CREATE or UPDATE user (first login বা profile update)
exports.createOrUpdateUser = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { firebaseUid, name, email, photoURL } = req.body;

    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "firebaseUid and email are required" });
    }

    // Check if user already exists
    const existingUser = await usersCollection.findOne({ firebaseUid });

    if (existingUser) {
      // Update existing user (name/photo change)
      await usersCollection.updateOne(
        { firebaseUid },
        {
          $set: {
            name: name || existingUser.name,
            photoURL: photoURL ?? existingUser.photoURL,
            updatedAt: new Date(),
          },
        }
      );

      const { _id, ...updatedUser } = existingUser;
      updatedUser.name = name || existingUser.name;
      updatedUser.photoURL = photoURL ?? existingUser.photoURL;
      updatedUser.updatedAt = new Date();

      console.log("🟢 User updated:", firebaseUid);
      return res.json({ message: "User updated", user: updatedUser });
    }

    // Create new user
    const newUser = {
      firebaseUid,
      name: name || "Anonymous User",
      email,
      photoURL: photoURL || null,
      isPremium: false,
      role: "user",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await usersCollection.insertOne(newUser);
    console.log("🟢 New user created with ID:", result.insertedId);

    const { _id, ...createdUser } = newUser;
    res.status(201).json({ message: "User created successfully", user: createdUser });
  } catch (error) {
    console.error("❌ Create/Update user error:", error);
    res.status(500).json({ message: "Failed to process user" });
  }
};

// UPDATE user profile (name/photo change – protected route)
exports.updateUserProfile = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { name, photoURL } = req.body;
    const firebaseUid = req.params.uid;

    if (!name && photoURL === undefined) {
      return res.status(400).json({ message: "Nothing to update" });
    }

    const updateFields = { updatedAt: new Date() };
    if (name) updateFields.name = name;
    if (photoURL !== undefined) updateFields.photoURL = photoURL;

    const result = await usersCollection.updateOne(
      { firebaseUid },
      { $set: updateFields }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    console.log("🟢 Profile updated for UID:", firebaseUid);
    res.json({ message: "Profile updated successfully" });
  } catch (error) {
    console.error("❌ Update profile error:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
};

// Make user Premium (Stripe webhook থেকে call করবে – export করা)
exports.makeUserPremium = async (firebaseUid) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { firebaseUid },
      { $set: { isPremium: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      console.warn("⚠️ User not found for premium upgrade:", firebaseUid);
      return;
    }

    console.log(`🟡 User ${firebaseUid} upgraded to Premium`);
  } catch (error) {
    console.error("❌ Premium upgrade error:", error);
  }
};

module.exports = {
  getUserByUid: exports.getUserByUid,
  createOrUpdateUser: exports.createOrUpdateUser,
  updateUserProfile: exports.updateUserProfile,
  makeUserPremium: exports.makeUserPremium,
};