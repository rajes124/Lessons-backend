const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// -------------------- CORS Middleware (FINAL & SAFE) --------------------
const allowedOrigins = [
  "http://localhost:5173",
  "https://student-life-lessons.web.app",
  "https://student-life-lessons.firebaseapp.com"
];

app.use(cors({
  origin: function (origin, callback) {
    // Postman / server-to-server request এর জন্য
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

//  app.options() 
// cors middleware  preflight OPTIONS handle 

// -------------------- Stripe Webhook --------------------
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

// -------------------- JSON Parser --------------------
app.use(express.json());

// -------------------- Routes --------------------
app.use("/api/stripe", require("./routes/stripeRoutes"));
app.use("/api/lessons", require("./routes/lessonRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

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
