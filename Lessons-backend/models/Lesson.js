const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  emotionalTone: { type: String, required: true },
  imageURL: String,
  visibility: { type: String, enum: ['public', 'private'], default: 'private' },
  accessLevel: { type: String, enum: ['free', 'premium'], default: 'free' },
  creatorId: { type: String, required: true }, // Firebase UID
  likes: [{ type: String }], 
  likesCount: { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Lesson', lessonSchema);
