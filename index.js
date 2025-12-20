<<<<<<< HEAD
=======
// backend/server.js

>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

<<<<<<< HEAD
// 🔥 ADD: Stripe init (env থেকে key নিচ্ছে)
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

// ⚠️ Normal API গুলোর জন্য
app.use(express.json());

// -------------------- Routes Import --------------------
const lessonRoutes = require("./routes/lessonRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

// 🔥 ADD: Stripe routes
// Existing routes এর সাথে add করো
app.use("/api/stripe", require("./routes/stripeRoutes"));

// -------------------- MongoDB --------------------
const uri = process.env.MONGO_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
});

async function run() {
  try {
    await client.connect();
    console.log("✅ MongoDB Connected Successfully");

<<<<<<< HEAD
    // 🔥 ADD: users collection
    const usersCollection = client
      .db("studentLifeDB") // ⚠️ তোমার DB নাম
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

=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

<<<<<<< HEAD
run();

// -------------------- Server Start --------------------
app.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
