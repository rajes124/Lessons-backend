// src/routes/lessonRoutes.js
const express = require('express');
const router = express.Router();

const {
  addLesson,
  getPublicLessons,
  getLessonDetails,
  toggleLike,
  toggleFavorite,
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
  getMyLessons
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

// Delete Lesson (দুটো রুটই রাখা হয়েছে – তোমার অরিজিনালে দুটো ছিল)
router.delete("/delete/:id", verifyToken, deleteLesson);
router.delete("/:id", verifyToken, deleteLesson);

router.post("/like/:id", verifyToken, toggleLike);
router.post("/favorite/:id", verifyToken, toggleFavorite);
router.post("/comment/:id", verifyToken, addComment);
router.get("/comments/:id", getComments);

// -------------------- My Lessons Route --------------------
router.get("/my-lessons", verifyToken, getMyLessons);

// -------------------- Admin Routes (Featured management) --------------------
router.post("/featured/:id", verifyToken, verifyAdmin, setFeatured);
router.put("/featured/:id", verifyToken, verifyAdmin, updateFeatured);
router.delete("/featured/:id", verifyToken, verifyAdmin, removeFeatured);

module.exports = router;