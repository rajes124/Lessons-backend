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