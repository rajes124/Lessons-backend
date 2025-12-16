// backend/controllers/lessonController.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "LessonsDB";

// ---------------------- Add Lesson ----------------------
const addLesson = async (req, res) => {
  try {
    const userId = req.user.uid;
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
    console.error("Add lesson error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Get Public Lessons ----------------------
const getPublicLessons = async (req, res) => {
  try {
    const userId = req.user?.uid;

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection("lessons");
    const usersCollection = db.collection("users");

    const currentUser = userId ? await usersCollection.findOne({ firebaseUid: userId }) : null;
    const isPremium = currentUser?.isPremium || false;

    let query = { visibility: "public" };

    if (!isPremium) {
      query.accessLevel = "free";
    }

    const lessons = await lessonsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .toArray();

    res.json(lessons);
  } catch (error) {
    console.error("Get public lessons error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Get Lesson Details ----------------------
const getLessonDetails = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user?.uid;

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection("lessons");
    const usersCollection = db.collection("users");

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const currentUser = userId ? await usersCollection.findOne({ firebaseUid: userId }) : null;
    const isPremium = currentUser?.isPremium || false;
    const isOwner = lesson.creatorId === userId;

    if (lesson.accessLevel === "premium" && !isPremium && !isOwner) {
      return res.status(403).json({ message: "Upgrade to Premium to view this lesson" });
    }

    res.json({ lesson });
  } catch (error) {
    console.error("Get lesson details error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Toggle Like ----------------------
const toggleLike = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection("lessons");

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    let update;
    if (lesson.likes.includes(userId)) {
      update = { $pull: { likes: userId }, $inc: { likesCount: -1 } };
    } else {
      update = { $push: { likes: userId }, $inc: { likesCount: 1 } };
    }

    await lessonsCollection.updateOne({ _id: new ObjectId(lessonId) }, update);
    res.json({ message: "Like toggled successfully" });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Toggle Favorite ----------------------
const toggleFavorite = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const favoritesCollection = db.collection("favorites");

    const existing = await favoritesCollection.findOne({ userId, lessonId: new ObjectId(lessonId) });

    if (existing) {
      await favoritesCollection.deleteOne({ _id: existing._id });
      res.json({ message: "Removed from favorites" });
    } else {
      await favoritesCollection.insertOne({ userId, lessonId: new ObjectId(lessonId), createdAt: new Date() });
      res.json({ message: "Added to favorites" });
    }
  } catch (error) {
    console.error("Toggle favorite error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Add Comment ----------------------
const addComment = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const commentsCollection = db.collection("comments");

    const newComment = {
      lessonId: new ObjectId(lessonId),
      userId,
      comment,
      createdAt: new Date(),
    };

    await commentsCollection.insertOne(newComment);
    res.json({ message: "Comment added successfully" });
  } catch (error) {
    console.error("Add comment error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Get Comments ----------------------
const getComments = async (req, res) => {
  try {
    const lessonId = req.params.id;

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const commentsCollection = db.collection("comments");
    const usersCollection = db.collection("users");

    const comments = await commentsCollection
      .find({ lessonId: new ObjectId(lessonId) })
      .sort({ createdAt: -1 })
      .toArray();

    const enrichedComments = await Promise.all(
      comments.map(async (comment) => {
        const user = await usersCollection.findOne({ firebaseUid: comment.userId });
        return {
          ...comment,
          userName: user?.name || "Anonymous",
          userPhoto: user?.photoURL || null,
        };
      })
    );

    res.json({ comments: enrichedComments });
  } catch (error) {
    console.error("Get comments error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Update Lesson ----------------------
const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;
    const updates = req.body;

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection("lessons");
    const usersCollection = db.collection("users");

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    const isAdmin = currentUser?.role === "admin";

    if (lesson.creatorId !== userId && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to update this lesson" });
    }

    if (updates.accessLevel === "premium" && !currentUser?.isPremium) {
      return res.status(403).json({ message: "Upgrade to Premium to make lesson premium" });
    }

    updates.updatedAt = new Date();

    await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: updates }
    );

    res.json({ message: "Lesson updated successfully" });
  } catch (error) {
    console.error("Update lesson error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Delete Lesson ----------------------
const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection("lessons");
    const favoritesCollection = db.collection("favorites");
    const commentsCollection = db.collection("comments");
    const usersCollection = db.collection("users");

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    const isAdmin = currentUser?.role === "admin";

    if (lesson.creatorId !== userId && !isAdmin) {
      return res.status(403).json({ message: "Not authorized to delete this lesson" });
    }

    await lessonsCollection.deleteOne({ _id: new ObjectId(lessonId) });
    await favoritesCollection.deleteMany({ lessonId: new ObjectId(lessonId) });
    await commentsCollection.deleteMany({ lessonId: new ObjectId(lessonId) });

    res.json({ message: "Lesson deleted successfully" });
  } catch (error) {
    console.error("Delete lesson error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

module.exports = {
  addLesson,
  getPublicLessons,
  getLessonDetails,
  toggleLike,
  toggleFavorite,
  addComment,
  getComments,
  updateLesson,
  deleteLesson,
};