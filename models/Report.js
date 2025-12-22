const mongoose = require("mongoose");
const { MongoClient, ObjectId } = require("mongodb");

const client = new MongoClient(process.env.MONGO_URI);
const dbName = process.env.DB_NAME || "LessonsDB";

// ===================== Report Schema (Mongoose) =====================
const reportSchema = new mongoose.Schema(
  {
    lessonId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Lesson",
      required: true,
    },
    reporterId: String,
    reason: { type: String, required: true },
  },
  { timestamps: true }
);

const Report = mongoose.model("Report", reportSchema);

// ===================== Add Report Controller =====================
const addReport = async (req, res) => {
  try {
    const reporterId = req.user.uid;
    const { lessonId, reason } = req.body;

    if (!reason) {
      return res.status(400).json({ message: "Reason required" });
    }

    await client.connect();
    const db = client.db(dbName);
    const reportsCollection = db.collection("reports");

    const report = {
      lessonId: new ObjectId(lessonId),
      reporterId,
      reason,
      createdAt: new Date(),
    };

    await reportsCollection.insertOne(report);

    res.json({ message: "Report submitted" });
  } catch (error) {
    console.error("Add report error:", error);
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};

module.exports = {
  Report,
  addReport,
};
