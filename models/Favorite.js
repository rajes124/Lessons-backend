<<<<<<< HEAD
const mongoose = require('mongoose');

const favoriteSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Favorite', favoriteSchema);
=======
// add favorite

const addFavorite = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { lessonId } = req.body;

    await client.connect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection("favorites");

    const existing = await favoritesCollection.findOne({ userId, lessonId });
    if (existing) {
      return res.json({ message: "Already favorited" });
    }

    const favorite = {
      userId,
      lessonId,
      createdAt: new Date(),
    };

    await favoritesCollection.insertOne(favorite);
    res.json({ message: "Added to favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// remove favorite

const removeFavorite = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { lessonId } = req.body;

    await client.connect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection("favorites");

    await favoritesCollection.deleteOne({ userId, lessonId });
    res.json({ message: "Removed from favorites" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
