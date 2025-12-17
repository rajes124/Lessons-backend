const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'LessonsDB';

// Get All Users
const getAllUsers = async (req, res) => {
  try {
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
  }
};

// Update User Role
const updateUserRole = async (req, res) => {
  try {
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
  }
};

// Delete User
const deleteUser = async (req, res) => {
  try {
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
  }
};

// Get All Lessons
const getAllLessons = async (req, res) => {
  try {
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
  }
};

// Feature Lesson
const featureLesson = async (req, res) => {
  try {
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
  }
};

// Delete Lesson (Admin)
const deleteLessonAdmin = async (req, res) => {
  try {
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
  }
};

// Get Reported Lessons
const getReportedLessons = async (req, res) => {
  try {
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
  }
};

// Ignore Reported Lesson
const ignoreReportedLesson = async (req, res) => {
  try {
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
