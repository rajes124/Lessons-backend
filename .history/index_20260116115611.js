const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// ────────────────────────────────────────────────
// MOST IMPORTANT FIX FOR VERCEL CORS (preflight)
// Put this BEFORE everything else
// ────────────────────────────────────────────────
app.options(/.*/, (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.status(204).end();
});

// Your original CORS (improved a little for safety)
const allowedOrigins = [
  "http://localhost:5173",
  "https://student-life-lessons.web.app",
  "https://student-life-lessons.firebaseapp.com"
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Stripe webhook needs raw body → this must come before express.json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// Normal JSON parser for other routes
app.use(express.json());

// Your routes (exactly the same)
app.use("/api/stripe", require("./routes/stripeRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// MongoDB connection
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
    console.log("✅ MongoDB Connected Successfully");

    // Test route (your original)
    app.get("/", (req, res) => {
      res.send("Student Life Lessons Backend is running 🚀");
    });

    // 404 handler (your original)
    app.use((req, res) => {
      res.status(404).json({ message: "API route not found" });
    });

    // Start server
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

run();