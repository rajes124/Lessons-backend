const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?appName=website0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected");

    const lessonsCollection = client
      .db("LessonsDB")
      .collection("lessons");

    // test route
    app.get("/", (req, res) => {
      res.send("Backend server is running 🚀");
    });

    // test api
    app.get("/lessons", async (req, res) => {
      const result = await lessonsCollection.find().toArray();
      res.send(result);
    });

  } catch (error) {
    console.log(error);
  }
}

run();

app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
