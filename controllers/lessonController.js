<<<<<<< HEAD
const { ObjectId } = require('mongodb');  // MongoClient আর uri লাগবে না
require('dotenv').config();

const connectDB = require('../config/db');  // তোমার config/db.js থেকে import

// ---------------------- Featured Lessons ----------------------
const getFeaturedLessons = async (req, res) => {
  try {
    const db = await connectDB();  // নতুন: connectDB ব্যবহার
    const lessonsCollection = db.collection('lessons');

    const featured = await lessonsCollection
      .find({
        visibility: 'public',  // lowercase 'public'
        $or: [
          { isFeatured: true },
          { featured: true },
          { isFeatured: { $exists: true, $ne: false } }
        ]
      })
      .sort({ createdAt: -1 })
      .limit(6)
      .toArray();

    res.json(featured || []);
  } catch (error) {
    console.error("Get featured lessons error:", error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
  // finally { client.close() } মুছে ফেলা হয়েছে
};

// ---------------------- Set Featured ----------------------
const setFeatured = async (req, res) => {
  const lessonId = req.params.id;
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: { isFeatured: true } }
    );

    res.json({ message: 'Lesson set as featured' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ---------------------- Update Featured ----------------------
const updateFeatured = async (req, res) => {
  const lessonId = req.params.id;
  const { featured } = req.body;
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $set: { isFeatured: featured } }
    );

    res.json({ message: 'Featured status updated' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ---------------------- Remove Featured ----------------------
const removeFeatured = async (req, res) => {
  const lessonId = req.params.id;
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    await lessonsCollection.updateOne(
      { _id: new ObjectId(lessonId) },
      { $unset: { isFeatured: "" } }
    );

    res.json({ message: 'Featured removed' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};

// ---------------------- Most Saved Lessons ----------------------
const getMostSavedLessons = async (req, res) => {
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    const mostSaved = await lessonsCollection.aggregate([
      { $match: { visibility: 'public' } },
      {
        $addFields: {
          savedCount: { $size: { $ifNull: ["$savedBy", []] } }
        }
      },
      { $sort: { savedCount: -1 } },
      { $limit: 6 },
      { $project: { savedCount: 0 } }
    ]).toArray();

    res.json(mostSaved || []);
  } catch (error) {
    console.error("Get most saved lessons error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// ---------------------- Top Contributors ----------------------
const getTopContributors = async (req, res) => {
  try {
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    const top = await lessonsCollection.aggregate([
      { $match: { visibility: 'public', creatorId: { $exists: true } } },
      {
        $group: {
          _id: '$creatorId',
          lessonCount: { $sum: 1 }
        }
      },
      { $sort: { lessonCount: -1 } },
      { $limit: 4 },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: 'firebaseUid',
          as: 'user'
        }
      },
      { $unwind: { path: '$user', preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          name: { $ifNull: ['$user.name', 'Anonymous User'] },
          photoURL: { $ifNull: ['$user.photoURL', 'https://i.pravatar.cc/300'] },
          lessonCount: 1
        }
      }
    ]).toArray();

    res.json(top || []);
  } catch (error) {
    console.error("Get top contributors error:", error);
    res.status(500).json({ message: 'Server Error' });
  }
};
=======
// backend/controllers/lessonController.js

const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || "LessonsDB";
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680

// ---------------------- Add Lesson ----------------------
const addLesson = async (req, res) => {
  try {
    const userId = req.user.uid;
<<<<<<< HEAD
    const { title, description, category, emotionalTone, imageURL, visibility, accessLevel } = req.body;

    const db = await connectDB();
    const usersCollection = db.collection('users');
    const lessonsCollection = db.collection('lessons');

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    if (accessLevel?.toLowerCase() === 'premium' && !currentUser.isPremium) {
      return res.status(403).json({ message: 'Upgrade to Premium to create premium lessons' });
    }

    const lesson = {
      title: title.trim(),
      description: description.trim(),
      category,
      emotionalTone,
      imageURL: imageURL || null,
      visibility: visibility || 'Private',
      accessLevel: accessLevel || 'Free',
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
      creatorId: userId,
      creatorName: currentUser.name || "Anonymous",
      creatorPhoto: currentUser.photoURL || null,
      likes: [],
      likesCount: 0,
<<<<<<< HEAD
      savedBy: [],
      isFeatured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await lessonsCollection.insertOne(lesson);
    res.json({ message: 'Lesson added successfully', lessonId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ---------------------- Public Lessons ----------------------
// ---------------------- Public Lessons ----------------------
const getPublicLessons = async (req, res) => {
  try {
    const userId = req.user?.uid || null;
    const { page = 1, limit = 10, category, emotionalTone, search } = req.query;

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    let isPremium = false;
    if (userId) {
      const currentUser = await usersCollection.findOne({ firebaseUid: userId });
      isPremium = currentUser?.isPremium || false;
    }

    // 🔥 সঠিক query – "Public" বা "public" দুটোই match করবে
    let query = {
      visibility: { $regex: /^public$/i }   // এটা exact "public" (case-insensitive)
    };

    // অতিরিক্ত filters
    if (category) {
      query.category = category;
    }
    if (emotionalTone) {
      query.emotionalTone = emotionalTone;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Total count
    const total = await lessonsCollection.countDocuments(query);

    // Lessons fetch with pagination
    const lessons = await lessonsCollection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((parseInt(page) - 1) * parseInt(limit))
      .limit(parseInt(limit))
      .toArray();

    // Premium lesson blur logic
    const processedLessons = lessons.map(lesson => {
      if (lesson.accessLevel?.toLowerCase() === 'premium' && !isPremium) {
        return {
          ...lesson,
          title: 'Premium Lesson – Upgrade to view',
          description: 'This lesson is for Premium users only.',
          blurred: true,
          imageURL: null // blur effect এর জন্য image লুকানো
        };
      }
      return { ...lesson, blurred: false };
    });

    res.json({
      lessons: processedLessons,
      totalPages: Math.ceil(total / parseInt(limit)),
      totalLessons: total,
      page: parseInt(page)
    });

  } catch (error) {
    console.error("Get public lessons error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};

// ---------------------- Lesson Details ----------------------
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const getLessonDetails = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user?.uid;

<<<<<<< HEAD
    if (!ObjectId.isValid(lessonId))
      return res.status(400).json({ message: 'Invalid lesson ID' });

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const currentUser = userId ? await usersCollection.findOne({ firebaseUid: userId }) : null;
    const isPremium = currentUser?.isPremium || false;

    // FIX: case-insensitive
    if (lesson.accessLevel?.toLowerCase() === 'premium' && !isPremium && lesson.creatorId !== userId) {
      return res.status(403).json({ message: 'Upgrade to Premium to view this lesson' });
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
    }

    res.json({ lesson });
  } catch (error) {
<<<<<<< HEAD
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// বাকি সব ফাংশন (তোমার অরিজিনাল কোড অক্ষত রেখে শুধু connectDB যোগ করা)

=======
    console.error("Get lesson details error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Toggle Like ----------------------
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const toggleLike = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

<<<<<<< HEAD
    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });
=======
    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection("lessons");

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: "Lesson not found" });
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680

    let update;
    if (lesson.likes.includes(userId)) {
      update = { $pull: { likes: userId }, $inc: { likesCount: -1 } };
    } else {
      update = { $push: { likes: userId }, $inc: { likesCount: 1 } };
    }

    await lessonsCollection.updateOne({ _id: new ObjectId(lessonId) }, update);
<<<<<<< HEAD
    res.json({ message: 'Like toggled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// ---------------------- Get My Favorites ----------------------
const getMyFavorites = async (req, res) => {
  try {
    const userId = req.user.uid; // firebase uid

    const db = await connectDB();
    const favoritesCollection = db.collection('favorites'); // তোমার favorites collection

    // favorites collection থেকে user-এর সব favorite lessonId নিয়ে আসা
    const userFavorites = await favoritesCollection
      .find({ userId })
      .toArray();

    // lessonId গুলো extract করা
    const lessonIds = userFavorites.map(fav => new ObjectId(fav.lessonId));

    if (lessonIds.length === 0) {
      return res.json({ favorites: [] });
    }

    const lessonsCollection = db.collection('lessons');

    // সব favorite lesson full details সহ fetch করা
    const favoritesLessons = await lessonsCollection
      .find({ _id: { $in: lessonIds } })
      .toArray();

    res.json({ favorites: favoritesLessons });
  } catch (error) {
    console.error("Get my favorites error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
  }
};
=======
    res.json({ message: "Like toggled successfully" });
  } catch (error) {
    console.error("Toggle like error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

// ---------------------- Toggle Favorite ----------------------
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const toggleFavorite = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;
<<<<<<< HEAD
    const db = await connectDB();
    const favoritesCollection = db.collection('favorites');
    const existing = await favoritesCollection.findOne({ userId, lessonId: new ObjectId(lessonId) });
    if (existing) {
      await favoritesCollection.deleteOne({ _id: existing._id });
      res.json({ message: 'Removed from favorites' });
    } else {
      await favoritesCollection.insertOne({ userId, lessonId: new ObjectId(lessonId), createdAt: new Date() });
      res.json({ message: 'Added to favorites' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

//addCommnet//

=======

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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const addComment = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;
    const { comment } = req.body;

<<<<<<< HEAD
    const db = await connectDB();
    const commentsCollection = db.collection('comments');
=======
    if (!comment) {
      return res.status(400).json({ message: "Comment is required" });
    }

    if (!ObjectId.isValid(lessonId)) {
      return res.status(400).json({ message: "Invalid lesson ID" });
    }

    await client.connect();
    const db = client.db(dbName);
    const commentsCollection = db.collection("comments");
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680

    const newComment = {
      lessonId: new ObjectId(lessonId),
      userId,
      comment,
<<<<<<< HEAD
      createdAt: new Date()
    };

    await commentsCollection.insertOne(newComment);
    res.json({ message: 'Comment added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const getComments = async (req, res) => {
  try {
    const lessonId = req.params.id;

<<<<<<< HEAD
    const db = await connectDB();
    const commentsCollection = db.collection('comments');
    const usersCollection = db.collection('users');

    const comments = await commentsCollection.aggregate([
      { $match: { lessonId: new ObjectId(lessonId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'userId',
          foreignField: 'firebaseUid',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          comment: 1,
          createdAt: 1,
          userName: '$user.name',
          userPhoto: '$user.photoURL'
        }
      },
      { $sort: { createdAt: -1 } }
    ]).toArray();

    res.json({ comments });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const updateLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;
    const updates = req.body;

<<<<<<< HEAD
    if (!ObjectId.isValid(lessonId))
      return res.status(400).json({ message: 'Invalid lesson ID' });

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    const isAdmin = currentUser?.role === 'admin';

    if (lesson.creatorId !== userId && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to update this lesson' });

    if (updates.accessLevel?.toLowerCase() === 'premium' && !currentUser?.isPremium)
      return res.status(403).json({ message: 'Upgrade to Premium to create/update premium lessons' });

    updates.updatedAt = new Date();
    await lessonsCollection.updateOne({ _id: new ObjectId(lessonId) }, { $set: updates });
    res.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

<<<<<<< HEAD
    if (!ObjectId.isValid(lessonId))
      return res.status(400).json({ message: 'Invalid lesson ID' });

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    const isAdmin = currentUser?.role === 'admin';

    if (lesson.creatorId !== userId && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to delete this lesson' });

    await lessonsCollection.deleteOne({ _id: new ObjectId(lessonId) });

    const favoritesCollection = db.collection('favorites');
    const commentsCollection = db.collection('comments');
    await favoritesCollection.deleteMany({ lessonId: lesson._id });
    await commentsCollection.deleteMany({ lessonId: lesson._id });

    res.json({ message: 'Lesson deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

const getMyLessons = async (req, res) => {
  try {
    const userId = req.user.uid;

    const db = await connectDB();
    const lessonsCollection = db.collection('lessons');

    const myLessons = await lessonsCollection
      .find({ creatorId: userId })
      .sort({ createdAt: -1 })
      .toArray();

    res.json({ lessons: myLessons });
  } catch (error) {
    console.error("Get my lessons error:", error);
    res.status(500).json({ message: "Server Error", error: error.message });
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  }
};

module.exports = {
  addLesson,
  getPublicLessons,
  getLessonDetails,
  toggleLike,
  toggleFavorite,
<<<<<<< HEAD
  toggleFavorite,
=======
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  addComment,
  getComments,
  updateLesson,
  deleteLesson,
<<<<<<< HEAD
  getFeaturedLessons,
  getMostSavedLessons,
  getTopContributors,
  
  setFeatured,
  updateFeatured,
  removeFeatured,
  getMyLessons,
  getMyFavorites,
=======
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
};