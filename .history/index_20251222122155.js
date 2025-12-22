// backend/index.js

const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

// ADD: Stripe init 
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

const app = express();
const port = process.env.PORT || 5000;

// -------------------- Middleware --------------------
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);


app.use(express.json());

// -------------------- Routes Import --------------------
const lessonRoutes = require("./routes/lessonRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

//  ADD: Stripe routes
app.use("/api/stripe", require("./routes/stripeRoutes"));

// -------------------- MongoDB --------------------
const uri = process.env.MONGO_URI;

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
    console.log("✅ MongoDB Connected Successfully");

    //  ADD: users collection
    const usersCollection = client
      .db("studentLifeDB") //  DB 
      .collection("users");

    // -------------------- Test Route --------------------
    app.get("/", (req, res) => {
      res.send("Student Life Lessons Backend is running 🚀");
    });

    // -------------------- API Routes --------------------
    app.use("/api/lessons", lessonRoutes);
    app.use("/api/users", userRoutes);
    app.use("/api/admin", adminRoutes);

    // -------------------- 404 Handler --------------------
    app.use((req, res) => {
      res.status(404).json({ message: "API route not found" });
    });

    
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });

  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

run();

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("\nShutting down server...");
  await client.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});