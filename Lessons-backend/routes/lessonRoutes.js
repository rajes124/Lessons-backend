const express = require('express');
const {
  addLesson,
  getPublicLessons,
  getLessonDetails,
  toggleLike,
  toggleFavorite,
  addComment,
  getComments,
  updateLesson,
  deleteLesson
} = require('../controllers/lessonController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

// ---------------------- Add Lesson ----------------------
// Protected route: only logged-in users can add
router.post('/add', verifyToken, addLesson);

// ---------------------- Public Lessons ----------------------
// Anyone can access public lessons, logged-in users get premium access
router.get('/public', getPublicLessons);

// ---------------------- Lesson Details ----------------------
// Protected route: full details only for owner/premium users
router.get('/:id', verifyToken, getLessonDetails);

// ---------------------- Like / Unlike ----------------------
// Protected: user must be logged-in
router.post('/:id/like', verifyToken, toggleLike);

// ---------------------- Favorite / Unfavorite ----------------------
// Protected: user must be logged-in
router.post('/:id/favorite', verifyToken, toggleFavorite);

// ---------------------- Comments ----------------------
// Add comment (protected)
router.post('/:id/comment', verifyToken, addComment);
// Get all comments (public)
router.get('/:id/comments', getComments);

// ---------------------- Update Lesson ----------------------
// Protected: only owner or admin
router.put('/:id', verifyToken, updateLesson);

// ---------------------- Delete Lesson ----------------------
// Protected: only owner or admin
router.delete('/:id', verifyToken, deleteLesson);

module.exports = router;
