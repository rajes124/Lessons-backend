// backend/server.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "http://localhost:5173",
}));
app.use(express.json());

// MongoDB URI
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@website0.ahtmawh.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, {
  serverApi: { version: ServerApiVersion.v1 },
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");

    const db = client.db(process.env.DB_NAME || "LessonsDB");

    // Test route
    app.get("/", (req, res) => {
      res.send("Student Life Lessons Backend is running with MongoDB 🚀");
    });

   // Routes import করা – modular way
app.use("/api/users", require("./routes/Users"));          
app.use("/api/lessons", require("./routes/lessonRoutes"));      

// 404 handler – path ছাড়া
app.use((req, res) => {
  res.status(404).json({ message: "API route not found" });
}); 
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

run().catch(console.dir);

// Server start
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
  console.log(`Visit: http://localhost:${port}`);
});

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down server...");
  await client.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});