<<<<<<< HEAD
const express = require("express");
const router = express.Router();

=======
const express = require('express');
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
const {
  addLesson,
  getPublicLessons,
  getLessonDetails,
  toggleLike,
  toggleFavorite,
<<<<<<< HEAD
  getMyFavorites,
  addComment,
  getComments,
  updateLesson,
  deleteLesson,
  getFeaturedLessons,
  getMostSavedLessons,
  getTopContributors,
  setFeatured,
  updateFeatured,
  removeFeatured,
  getMyLessons  // ← এটা যোগ করলাম
} = require("../controllers/lessonController");

const verifyToken = require("../middleware/verifyToken");
const verifyAdmin = require("../middleware/verifyAdmin");

// -------------------- Public Routes --------------------
router.get("/public", getPublicLessons);               
router.get("/details/:id", getLessonDetails);         
router.get("/featured", getFeaturedLessons);
router.get("/most-saved", getMostSavedLessons);
router.get("/top-contributors", getTopContributors);
router.get("/my-favorites", verifyToken, getMyFavorites);

// -------------------- Protected Routes --------------------
router.post("/add", verifyToken, addLesson);
router.put("/update/:id", verifyToken, updateLesson);
// Protected Routes
router.delete("/delete/:id", verifyToken, deleteLesson); // 🔥 এটা ঠিক আছে কি?
router.delete("/:id", verifyToken, deleteLesson); // এটা যোগ করো

router.post("/like/:id", verifyToken, toggleLike);
router.post("/favorite/:id", verifyToken, toggleFavorite);
router.post("/comment/:id", verifyToken, addComment);
router.get("/comments/:id", getComments);

// -------------------- My Lessons Route (ঠিক করা) --------------------
router.get("/my-lessons", verifyToken, getMyLessons);  // ← inline remove করে এটা রাখো

// -------------------- Admin Routes (Featured management) --------------------
router.post("/featured/:id", verifyToken, verifyAdmin, setFeatured);
router.put("/featured/:id", verifyToken, verifyAdmin, updateFeatured);
router.delete("/featured/:id", verifyToken, verifyAdmin, removeFeatured);

module.exports = router;
=======
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
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
