require('dotenv').config();
const { MongoClient } = require('mongodb');

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
const dbName = 'LessonsDB';

async function run() {
  try {
    await client.connect();
    console.log('✅ Connected to MongoDB Atlas');

    const db = client.db(dbName);

    // 1. Users Collection
    const usersCollection = db.collection('users');
    await usersCollection.insertOne({
      firebaseUid: 'testUID123',
      name: 'Test User',
      email: 'testuser@example.com',
      photoURL: '',
      isPremium: false,
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 2. Lessons Collection
    const lessonsCollection = db.collection('lessons');
    await lessonsCollection.insertOne({
      title: 'Never Give Up',
      description: 'Persistence is key in life...',
      category: 'Personal Growth',
      emotionalTone: 'Motivational',
      imageURL: '',
      visibility: 'public',
      accessLevel: 'free',
      creatorId: 'testUID123',
      likes: [],
      likesCount: 0,
      featured: false,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 3. Favorites Collection
    const favoritesCollection = db.collection('favorites');
    await favoritesCollection.insertOne({
      userId: 'testUID123',
      lessonId: lessonsCollection.insertedId
    });

    // 4. Comments Collection
    const commentsCollection = db.collection('comments');
    await commentsCollection.insertOne({
      lessonId: lessonsCollection.insertedId,
      userId: 'testUID123',
      comment: 'This is a test comment!',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    // 5. Reports Collection
    const reportsCollection = db.collection('reports');
    await reportsCollection.insertOne({
      lessonId: lessonsCollection.insertedId,
      reporterId: 'testUID123',
      reason: 'Test Report',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    console.log('✅ Test data inserted and collections created successfully!');
  } catch (err) {
    console.error('❌ Error:', err);
  } finally {
    await client.close();
    console.log('Connection closed');
  }
}

run();
