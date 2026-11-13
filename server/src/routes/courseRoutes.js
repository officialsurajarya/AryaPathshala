const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseBySlug,
  getCategories,
  getPublicStats,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getCourses);
router.get("/public/stats", getPublicStats);
router.get("/categories", getCategories);
router.get("/:slug", getCourseBySlug);

// Admin & Teacher course management
router.post("/", authenticateUser, authorizeRoles("ADMIN", "TEACHER"), createCourse);
router.put("/:id", authenticateUser, authorizeRoles("ADMIN", "TEACHER"), updateCourse);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteCourse);

module.exports = router;
