const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// -------------------- Middleware --------------------

// Updated CORS: localhost + production URL দুটোই allow করা হয়েছে
// credentials: true রাখা হয়েছে যদি cookie/auth লাগে
app.use(cors({
  origin: [
    "http://localhost:5173",                  // তোমার local frontend (Vite/React)
    "https://student-life-lessons.web.app",   // তোমার live frontend
    "https://student-life-lessons.firebaseapp.com" // Firebase alternate domain
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
  optionsSuccessStatus: 200  // কিছু ব্রাউজারের জন্য লাগে
}));

// Explicitly handle OPTIONS preflight for all routes (Vercel-এ নিরাপদ)
app.options("/{*splat}", cors());  // এটা অ্যাড করলে preflight সবসময় 200 দেয়

// -------------------- Stripe Webhook --------------------
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

// -------------------- Normal JSON parser --------------------
app.use(express.json());

// -------------------- Routes --------------------
app.use("/api/stripe", require("./routes/stripeRoutes"));

const lessonRoutes = require("./routes/lessonRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

app.use("/api/lessons", lessonRoutes);
app.use("/api/users", userRoutes);
app.use("/api/admin", adminRoutes);

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
    // await client.connect(); // Optional: যদি route এ connect করো
    console.log("✅ MongoDB Connected Successfully");

    // -------------------- Test Route --------------------
    app.get("/", (req, res) => {
      res.send("Student Life Lessons Backend is running 🚀");
    });

    // -------------------- 404 Handler --------------------
    app.use((req, res) => {
      res.status(404).json({ message: "API route not found" });
    });

    // -------------------- Start Server --------------------
    app.listen(port, () => {
      console.log(`🚀 Server running on port ${port}`);
    });
  } catch (error) {
    console.error("❌ MongoDB Connection Failed:", error);
    process.exit(1);
  }
}

run();

// -------------------- Graceful Shutdown --------------------
process.on("SIGINT", async () => {
  console.log("\nShutting down server...");
  await client.close();
  console.log("MongoDB connection closed.");
  process.exit(0);
});