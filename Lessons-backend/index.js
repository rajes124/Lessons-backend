const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const db = client.db(process.env.DB_NAME);
    const lessonsCollection = db.collection("lessons");

    // Test route
    app.get("/", (req, res) => {
      res.send("Backend server is running 🚀");
    });

    // GET all lessons
    app.get("/lessons", async (req, res) => {
      try {
        const lessons = await lessonsCollection.find().toArray();
        res.json(lessons);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

    // POST new lesson
    app.post("/lessons", async (req, res) => {
      try {
        const lesson = req.body;
        const result = await lessonsCollection.insertOne(lesson);
        res.json(result);
      } catch (error) {
        res.status(500).json({ error: error.message });
      }
    });

  } catch (error) {
    console.error(error);
  }
}

run();

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
 