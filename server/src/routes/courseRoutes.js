const express = require("express");
const router = express.Router();
const {
  getCourses,
  getCourseBySlug,
  getCategories,
  createCourse,
  updateCourse,
  deleteCourse,
} = require("../controllers/courseController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getCourses);
router.get("/categories", getCategories);
router.get("/:slug", getCourseBySlug);

// Admin-only CRUD
router.post("/", authenticateUser, authorizeRoles("ADMIN"), createCourse);
router.put("/:id", authenticateUser, authorizeRoles("ADMIN"), updateCourse);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteCourse);

module.exports = router;
