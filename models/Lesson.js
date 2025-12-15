// backend/controllers/lessonController.js (অংশ)

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "LessonsDB";

const addLesson = async (req, res) => {
  try {
    const userId = req.user.uid; // Firebase UID from verifyToken
    const {
      title,
      description,
      category,
      emotionalTone,
      imageURL,
      visibility = "private",
      accessLevel = "free",
    } = req.body;

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection("users");
    const lessonsCollection = db.collection("lessons");

    // Check if user exists and premium status
    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    if (!currentUser) return res.status(404).json({ message: "User not found" });

    if (accessLevel === "premium" && !currentUser.isPremium) {
      return res.status(403).json({ message: "Upgrade to Premium to create premium lessons" });
    }

    const lesson = {
      title,
      description,
      category,
      emotionalTone,
      imageURL: imageURL || null,
      visibility,
      accessLevel,
      creatorId: userId,
      creatorName: currentUser.name || "Anonymous",
      creatorPhoto: currentUser.photoURL || null,
      likes: [],
      likesCount: 0,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await lessonsCollection.insertOne(lesson);
    res.status(201).json({ message: "Lesson added successfully", lessonId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    await client.close();
  }
};

module.exports = { addLesson /* অন্য functions */ };