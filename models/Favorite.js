const mongoose = require("mongoose");
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME || "LessonsDB";

// ===================== Favorite Schema (Mongoose) =====================
const favoriteSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
  },
  { timestamps: true }
);

const Favorite = mongoose.model("Favorite", favoriteSchema);

// ===================== Add Favorite =====================
const addFavorite = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { lessonId } = req.body;

    await client.connect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection("favorites");

    const existing = await favoritesCollection.findOne({
      userId,
      lessonId: new ObjectId(lessonId),
    });

    if (existing) {
      return res.json({ message: "Already favorited" });
    }

    const favorite = {
      userId,
      lessonId: new ObjectId(lessonId),
      createdAt: new Date(),
    };

    await favoritesCollection.insertOne(favorite);
    res.json({ message: "Added to favorites" });
  } catch (error) {
    console.error("Add favorite error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ===================== Remove Favorite =====================
const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { lessonId } = req.body;

    await client.connect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection("favorites");

    await favoritesCollection.deleteOne({
      userId,
      lessonId: new ObjectId(lessonId),
    });

    res.json({ message: "Removed from favorites" });
  } catch (error) {
    console.error("Remove favorite error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

module.exports = {
  Favorite,
  addFavorite,
  removeFavorite,
};
