const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  reporterId: String,
  reason: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Report', reportSchema);
