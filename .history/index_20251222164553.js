const express = require("express");
const cors = require("cors");
require("dotenv").config();
const { MongoClient, ServerApiVersion } = require("mongodb");

const app = express();
const port = process.env.PORT || 5000;

// -------------------- Middleware --------------------
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);

/**
 * ✅ Stripe Webhook
 * ⚠️ Stripe webhook-এর জন্য RAW body দরকার
 * তাই json middleware এর আগে রাখতে হবে
 */
app.use(
  "/api/stripe/webhook",
  express.raw({ type: "application/json" })
);

/**
 * ✅ Normal JSON parser
 * Checkout session + বাকি সব API এর জন্য
 */
app.use(express.json());

/**
 * ✅ Stripe Routes
 */
app.use("/api/stripe", require("./routes/stripeRoutes"));

// -------------------- Routes Import --------------------
const lessonRoutes = require("./routes/lessonRoutes");
const userRoutes = require("./routes/userRoutes");
const adminRoutes = require("./routes/adminRoutes");

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
  //  await client.connect();
    console.log("✅ MongoDB Connected Successfully");

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
