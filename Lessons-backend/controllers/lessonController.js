const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri);
const dbName = process.env.DB_NAME || 'LessonsDB';

// ---------------------- Add Lesson ----------------------
const addLesson = async (req, res) => {
  try {
    const userId = req.user.uid;
    const { title, description, category, emotionalTone, imageURL, visibility, accessLevel } = req.body;

    await client.connect();
    const db = client.db(dbName);
    const usersCollection = db.collection('users');
    const lessonsCollection = db.collection('lessons');

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });

    if (!currentUser) return res.status(404).json({ message: 'User not found' });

    if (accessLevel === 'premium' && !currentUser.isPremium) {
      return res.status(403).json({ message: 'Upgrade to Premium to create premium lessons' });
    }

    const lesson = {
      title,
      description,
      category,
      emotionalTone,
      imageURL: imageURL || null,
      visibility: visibility || 'private',
      accessLevel: accessLevel || 'free',
      creatorId: userId,
      likes: [],
      likesCount: 0,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await lessonsCollection.insertOne(lesson);

    res.json({ message: 'Lesson added successfully', lessonId: result.insertedId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Public Lessons ----------------------
const getPublicLessons = async (req, res) => {
  try {
    const userId = req.user?.uid;
    const { page = 1, limit = 10, category, emotionalTone, search } = req.query;

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    const currentUser = userId ? await usersCollection.findOne({ firebaseUid: userId }) : null;
    const isPremium = currentUser?.isPremium || false;

    let query = { visibility: 'public' };
    if (category) query.category = category;
    if (emotionalTone) query.emotionalTone = emotionalTone;
    if (search) query.title = { $regex: search, $options: 'i' };

    const total = await lessonsCollection.countDocuments(query);
    const lessons = await lessonsCollection.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .toArray();

    const result = lessons.map(lesson => {
      if (lesson.accessLevel === 'premium' && !isPremium) {
        return {
          ...lesson,
          title: 'Premium Lesson – Upgrade to view',
          description: 'This lesson is for Premium users only.',
          blurred: true
        };
      }
      return { ...lesson, blurred: false };
    });

    res.json({
      page: parseInt(page),
      totalPages: Math.ceil(total / limit),
      totalLessons: total,
      lessons: result
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Lesson Details ----------------------
const getLessonDetails = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user?.uid;

    if (!ObjectId.isValid(lessonId))
      return res.status(400).json({ message: 'Invalid lesson ID' });

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const currentUser = userId ? await usersCollection.findOne({ firebaseUid: userId }) : null;
    const isPremium = currentUser?.isPremium || false;

    if (lesson.accessLevel === 'premium' && !isPremium && lesson.creatorId !== userId) {
      return res.status(403).json({ message: 'Upgrade to Premium to view this lesson' });
    }

    res.json({ lesson });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Like / Unlike ----------------------
const toggleLike = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    let update;
    if (lesson.likes.includes(userId)) {
      update = { $pull: { likes: userId }, $inc: { likesCount: -1 } };
    } else {
      update = { $push: { likes: userId }, $inc: { likesCount: 1 } };
    }

    await lessonsCollection.updateOne({ _id: new ObjectId(lessonId) }, update);
    res.json({ message: 'Like toggled successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Favorite / Unfavorite ----------------------
const toggleFavorite = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

    await client.connect();
    const db = client.db(dbName);
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

    await client.connect();
    const db = client.db(dbName);
    const commentsCollection = db.collection('comments');

    const newComment = {
      lessonId: new ObjectId(lessonId),
      userId,
      comment,
      createdAt: new Date()
    };

    await commentsCollection.insertOne(newComment);
    res.json({ message: 'Comment added' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Get Comments ----------------------
const getComments = async (req, res) => {
  try {
    const lessonId = req.params.id;

    await client.connect();
    const db = client.db(dbName);
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

    if (!ObjectId.isValid(lessonId))
      return res.status(400).json({ message: 'Invalid lesson ID' });

    await client.connect();
    const db = client.db(dbName);
    const lessonsCollection = db.collection('lessons');
    const usersCollection = db.collection('users');

    const lesson = await lessonsCollection.findOne({ _id: new ObjectId(lessonId) });
    if (!lesson) return res.status(404).json({ message: 'Lesson not found' });

    const currentUser = await usersCollection.findOne({ firebaseUid: userId });
    const isAdmin = currentUser?.role === 'admin';

    if (lesson.creatorId !== userId && !isAdmin)
      return res.status(403).json({ message: 'Not authorized to update this lesson' });

    if (updates.accessLevel === 'premium' && !currentUser?.isPremium)
      return res.status(403).json({ message: 'Upgrade to Premium to create/update premium lessons' });

    updates.updatedAt = new Date();

    await lessonsCollection.updateOne({ _id: new ObjectId(lessonId) }, { $set: updates });
    res.json({ message: 'Lesson updated successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  } finally {
    await client.close();
  }
};

// ---------------------- Delete Lesson ----------------------
const deleteLesson = async (req, res) => {
  try {
    const lessonId = req.params.id;
    const userId = req.user.uid;

    if (!ObjectId.isValid(lessonId))
      return res.status(400).json({ message: 'Invalid lesson ID' });

    await client.connect();
    const db = client.db(dbName);
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
  deleteLesson
};
