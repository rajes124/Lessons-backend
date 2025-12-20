<<<<<<< HEAD
// backend/controllers/adminController.js

const { ObjectId } = require("mongodb");
const connectDB = require("../config/db");
=======
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'LessonsDB';
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680

// Get All Users
const getAllUsers = async (req, res) => {
  try {
<<<<<<< HEAD
    const db = await connectDB();
    const usersCollection = db.collection("users");
    const users = await usersCollection.find({}).toArray();
    res.json(users);
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Server error" });
=======
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const users = await usersCollection.find().toArray();
    res.json(users);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;
    const { role } = req.body;

    if (!["user", "admin"].includes(role)) {
      return res
        .status(400)
        .json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    const db = await connectDB();
    const usersCollection = db.collection("users");

    const result = await usersCollection.updateOne(
      { firebaseUid: id },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({ message: "User role updated successfully" });
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(500).json({ message: "Server error" });
=======
    const userId = req.params.id;
    const { role } = req.body; // user / admin
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');

    if (!['user', 'admin'].includes(role))
      return res.status(400).json({ message: 'Invalid role' });

    await usersCollection.updateOne({ _id: new ObjectId(userId) }, { $set: { role } });
    res.json({ message: 'User role updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;

    const db = await connectDB();
    const usersCollection = db.collection("users");
    const lessonsCollection = db.collection("lessons");
    const favoritesCollection = db.collection("favorites");
    const commentsCollection = db.collection("comments");

    const result = await usersCollection.deleteOne({ firebaseUid: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    await lessonsCollection.deleteMany({ creatorId: id });
    await favoritesCollection.deleteMany({ userId: id });
    await commentsCollection.deleteMany({ userId: id });

    res.json({ message: "User and all related content deleted successfully" });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: "Server error" });
=======
    const userId = req.params.id;
    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const lessonsCollection = db.collection('lessons');
    const favoritesCollection = db.collection('favorites');
    const commentsCollection = db.collection('comments');

    await usersCollection.deleteOne({ _id: new ObjectId(userId) });
    await lessonsCollection.deleteMany({ creatorId: userId });
    await favoritesCollection.deleteMany({ userId });
    await commentsCollection.deleteMany({ userId });

    res.json({ message: 'User and related content deleted' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Get All Lessons
const getAllLessons = async (req, res) => {
  try {
<<<<<<< HEAD
    const db = await connectDB();
    const lessons = await db.collection("lessons").find({}).toArray();
    res.json(lessons);
  } catch (err) {
    console.error("Get all lessons error:", err);
    res.json([]);
=======
    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');
    const lessons = await lessonsCollection.find().toArray();
    res.json(lessons);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Feature Lesson
const featureLesson = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;

    const db = await connectDB();
    const lessonsCollection = db.collection("lessons");

    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isFeatured: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    res.json({ message: "Lesson featured successfully" });
  } catch (err) {
    console.error("Feature lesson error:", err);
    res.status(500).json({ message: "Server error" });
=======
    const lessonId = req.params.id;
    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');

    await lessonsCollection.updateOne({ _id: new ObjectId(lessonId) }, { $set: { featured: true } });
    res.json({ message: 'Lesson marked as featured' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Delete Lesson (Admin)
const deleteLessonAdmin = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;

    const db = await connectDB();
    const lessonsCollection = db.collection("lessons");
    const favoritesCollection = db.collection("favorites");
    const commentsCollection = db.collection("comments");

    const result = await lessonsCollection.deleteOne({
      _id: new ObjectId(id),
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: "Lesson not found" });
    }

    await favoritesCollection.deleteMany({ lessonId: new ObjectId(id) });
    await commentsCollection.deleteMany({ lessonId: new ObjectId(id) });

    res.json({ message: "Lesson deleted by admin" });
  } catch (err) {
    console.error("Delete lesson error:", err);
    res.status(500).json({ message: "Server error" });
=======
    const lessonId = req.params.id;
    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');
    const favoritesCollection = db.collection('favorites');
    const commentsCollection = db.collection('comments');

    await lessonsCollection.deleteOne({ _id: new ObjectId(lessonId) });
    await favoritesCollection.deleteMany({ lessonId: new ObjectId(lessonId) });
    await commentsCollection.deleteMany({ lessonId: new ObjectId(lessonId) });

    res.json({ message: 'Lesson deleted by admin' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Get Reported Lessons
const getReportedLessons = async (req, res) => {
  try {
<<<<<<< HEAD
    const db = await connectDB();
    const reportsCollection = db.collection("reports");

    const reports = await reportsCollection
      .aggregate([
        {
          $group: {
            _id: "$lessonId",
            reportCount: { $sum: 1 },
            reasons: { $push: "$reason" },
          },
        },
        {
          $lookup: {
            from: "lessons",
            localField: "_id",
            foreignField: "_id",
            as: "lesson",
          },
        },
        { $unwind: { path: "$lesson", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            lesson: 1,
            reportCount: 1,
            reasons: 1,
          },
        },
        { $sort: { reportCount: -1 } },
      ])
      .toArray();

    res.json(reports);
  } catch (err) {
    console.error("Get reported lessons error:", err);
    res.json([]);
=======
    await client.connect();
    const db = client.db(dbName);
    const reportsCollection = db.collection('reports');
    const lessonsCollection = db.collection('lessons');

    const reports = await reportsCollection.aggregate([
      { $group: { _id: "$lessonId", count: { $sum: 1 }, reasons: { $push: "$reason" } } },
      { $lookup: { from: "lessons", localField: "_id", foreignField: "_id", as: "lesson" } }
    ]).toArray();

    res.json(reports);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

// Ignore Reported Lesson
const ignoreReportedLesson = async (req, res) => {
  try {
<<<<<<< HEAD
    const { id } = req.params;

    const db = await connectDB();
    await db
      .collection("reports")
      .deleteMany({ lessonId: new ObjectId(id) });

    res.json({ message: "Reports ignored for this lesson" });
  } catch (err) {
    console.error("Ignore report error:", err);
    res.status(500).json({ message: "Server error" });
=======
    const lessonId = req.params.id;
    await client.connect();
    const db = client.db(dbName);
    const reportsCollection = db.collection('reports');

    await reportsCollection.deleteMany({ lessonId: new ObjectId(lessonId) });
    res.json({ message: 'Reports ignored for this lesson' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  } finally {
    await client.close();
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

module.exports = {
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllLessons,
  featureLesson,
  deleteLessonAdmin,
  getReportedLessons,
<<<<<<< HEAD
  ignoreReportedLesson,
=======
  ignoreReportedLesson
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
};
