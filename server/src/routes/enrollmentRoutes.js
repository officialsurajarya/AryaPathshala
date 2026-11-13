const express = require("express");
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
  getTeacherStudents,
} = require("../controllers/enrollmentController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

router.post("/enroll", authenticateUser, enrollInCourse);
router.get("/my-courses", authenticateUser, getMyEnrollments);
router.get("/my", authenticateUser, getMyEnrollments);
router.put("/progress", authenticateUser, updateProgress);
router.get(
  "/teacher-students",
  authenticateUser,
  authorizeRoles("TEACHER", "ADMIN"),
  getTeacherStudents
);

module.exports = router;
