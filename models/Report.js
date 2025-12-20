<<<<<<< HEAD
const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  reporterId: String,
  reason: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
=======
// add report

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
      lessonId,
      reporterId,
      reason,
      createdAt: new Date(),
    };

    await reportsCollection.insertOne(report);
    res.json({ message: "Report submitted" });
  } catch (error) {
    res.status(500).json({ message: "Server Error" });
  } finally {
    await client.close();
  }
};
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
