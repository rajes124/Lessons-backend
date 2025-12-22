// backend/controllers/adminController.js

const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

// তোমার connectDB import করা হলো — এটা দিয়ে connection stable থাকবে
const connectDB = require("../config/db");

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'LessonsDB';

// Get All Users
const getAllUsers = async (req, res) => {
  try {
    const db = await connectDB();
    const usersCollection = db.collection('users');
    const users = await usersCollection.find({}).toArray();

    // _id বাদ দিয়ে clean data পাঠাও
    const cleanUsers = users.map(({ _id, ...user }) => user);
    res.json(users); 
    
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params; // firebaseUid
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role. Must be "user" or "admin"' });
    }

    const db = await connectDB();
    const usersCollection = db.collection('users');

    const result = await usersCollection.updateOne(
      { firebaseUid: id },
      { $set: { role, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({ message: 'User role updated successfully' });
  } catch (err) {
    console.error("Update user role error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params; // firebaseUid

    const db = await connectDB();
    const usersCollection = db.collection('users');
    const lessonsCollection = db.collection('lessons');
    const favoritesCollection = db.collection('favorites');
    const commentsCollection = db.collection('comments');

    // User delete
    const result = await usersCollection.deleteOne({ firebaseUid: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'User not found' });
    }

    // User-এর lessons, favorites, comments delete
    await lessonsCollection.deleteMany({ creatorId: id });
    await favoritesCollection.deleteMany({ userId: id });
    await commentsCollection.deleteMany({ userId: id });

    res.json({ message: 'User and all related content deleted successfully' });
  } catch (err) {
    console.error("Delete user error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get All Lessons
const getAllLessons = async (req, res) => {
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');
    const lessons = await lessonsCollection.find({}).toArray();

    res.json(lessons);
  } catch (err) {
    console.error("Get all lessons error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Feature Lesson
const featureLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    const result = await lessonsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { isFeatured: true, updatedAt: new Date() } }
    );

    if (result.matchedCount === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    res.json({ message: 'Lesson featured successfully' });
  } catch (err) {
    console.error("Feature lesson error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete Lesson (Admin)
const deleteLessonAdmin = async (req, res) => {
  try {
    const { id } = req.params;

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');
    const favoritesCollection = db.collection('favorites');
    const commentsCollection = db.collection('comments');

    const result = await lessonsCollection.deleteOne({ _id: new ObjectId(id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Lesson not found' });
    }

    await favoritesCollection.deleteMany({ lessonId: new ObjectId(id) });
    await commentsCollection.deleteMany({ lessonId: new ObjectId(id) });

    res.json({ message: 'Lesson deleted by admin' });
  } catch (err) {
    console.error("Delete lesson error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Get Reported Lessons (যদি reports collection থাকে)
const getReportedLessons = async (req, res) => {
  try {
    const db = await connectDB();
    const reportsCollection = db.collection('reports'); // তোমার collection নাম same
    const lessonsCollection = db.collection('lessons');

    const reports = await reportsCollection.aggregate([
      {
        $group: {
          _id: "$lessonId",
          reportCount: { $sum: 1 },
          reasons: { $push: "$reason" }
        }
      },
      {
        $lookup: {
          from: "lessons",
          localField: "_id",
          foreignField: "_id",
          as: "lesson"
        }
      },
      { $unwind: "$lesson" },
      {
        $project: {
          lesson: "$lesson",
          reportCount: 1,
          reasons: 1
        }
      },
      { $sort: { reportCount: -1 } }
    ]).toArray();

    res.json(reports);
  } catch (err) {
    console.error("Get reported lessons error:", err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Ignore Reported Lesson
const ignoreReportedLesson = async (req, res) => {
  try {
    const { id } = req.params;

    const db = await connectDB();
    const reportsCollection = db.collection('reports');

    await reportsCollection.deleteMany({ lessonId: new ObjectId(id) });
    res.json({ message: 'Reports ignored for this lesson' });
  } catch (err) {
    console.error("Ignore report error:", err);
    res.status(500).json({ message: 'Server error' });
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
  ignoreReportedLesson
};