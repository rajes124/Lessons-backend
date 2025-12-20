// backend/controllers/userController.js

const connectDB = require("../config/db"); // 🔥 এটা ঠিক আছে – use করছি

// GET user by firebaseUid
exports.getUserByUid = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const user = await usersCollection.findOne({ firebaseUid: req.params.uid });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // _id remove করে পাঠাও (frontend-এ দরকার নেই)
    const { _id, ...userData } = user;
    console.log("🔵 Sending userData to frontend:", userData); // ডিবাগের জন্য রাখলাম
    res.json(userData);
  } catch (error) {
    console.error("❌ Get user error:", error);
    res.status(500).json({ message: "Server error while fetching user" });
  }
};

// CREATE new user (first login – যখন 404 পায়)
exports.createUser = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection("users");

    const { firebaseUid, name, email, photoURL } = req.body;

    // Validation
    if (!firebaseUid || !email) {
      return res.status(400).json({ message: "firebaseUid and email are required" });
    }

    // Check if already exists (duplicate prevent)
    const existingUser = await usersCollection.findOne({ firebaseUid });
    if (existingUser) {
      const { _id, ...userData } = existingUser;
      console.log("🟢 User already exists, returning data:", userData);
      return res.status(200).json(userData); // already exists → just return
    }

    // Create new user
    const newUser = {
      firebaseUid,
      name: name || "Anonymous User",
      email,
      photoURL: photoURL || null,
      isPremium: false,
      role: "user",                    // নতুন ইউজার → user role
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
};