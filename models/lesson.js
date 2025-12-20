const express = require("express");
const router = express.Router();

const {
  addLesson,
  getPublicLessons,
  getLessonDetails,
  toggleLike,
  toggleFavorite,
  addComment,
  getComments,
  updateLesson,
  deleteLesson,
  getFeaturedLessons,
  getMostSavedLessons,
  getTopContributors,
  setFeatured,
  updateFeatured,
  removeFeatured
} = require("../controllers/lessonController");

const { verifyToken, verifyAdmin } = require("../middlewares/auth");

// -------------------- Public Routes --------------------
router.get("/public", getPublicLessons);
router.get("/details/:id", getLessonDetails);
router.get("/featured", getFeaturedLessons);
router.get("/most-saved", getMostSavedLessons);
router.get("/top-contributors", getTopContributors);

// -------------------- Protected Routes --------------------
router.post("/add", verifyToken, addLesson);
router.put("/update/:id", verifyToken, updateLesson);
router.delete("/delete/:id", verifyToken, deleteLesson);

router.post("/like/:id", verifyToken, toggleLike);
router.post("/favorite/:id", verifyToken, toggleFavorite);
router.post("/comment/:id", verifyToken, addComment);
router.get("/comments/:id", getComments);
router.post('/add', verifyToken, addLesson);

// -------------------- Admin Protected Routes (Featured management) --------------------
router.post("/featured/:id", verifyToken, verifyAdmin, setFeatured);
router.put("/featured/:id", verifyToken, verifyAdmin, updateFeatured);
router.delete("/featured/:id", verifyToken, verifyAdmin, removeFeatured);

module.exports = router;
