const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// ────────────────────────────────────────────────
// SUPER EARLY & UNCONDITIONAL PREFIGHT HANDLER
// Vercel-এ এটা সবচেয়ে reliable কাজ করে
// ────────────────────────────────────────────────
app.use((req, res, next) => {
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "http://localhost:5173"); // dev-এর জন্য
    // production-এর জন্য comment খুলো: res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, x-vercel-protection-bypass");
    return res.status(204).end();
  }
  next();
});

// Regular CORS middleware (keep it after the OPTIONS catch-all)
const allowedOrigins = [
  "http://localhost:5173",
  "https://student-life-lessons.web.app",
  "https://student-life-lessons.firebaseapp.com"
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// Stripe webhook (raw body) – must be before json()
app.use("/api/stripe/webhook", express.raw({ type: "application/json" }));

// JSON for all other routes
app.use(express.json());

// Routes
app.use("/api/stripe", require("./routes/stripeRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

// MongoDB
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
    await client.connect(); // ensure connection
    console.log("✅ MongoDB Connected Successfully");

    app.get("/", (req, res) => {
      res.send("Student Life Lessons Backend is running 🚀");
    });

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