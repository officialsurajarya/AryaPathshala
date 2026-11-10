const express = require("express");
const router = express.Router();
const {
  enrollInCourse,
  getMyEnrollments,
  updateProgress,
} = require("../controllers/enrollmentController");
const { authenticateUser } = require("../middleware/authMiddleware");

router.post("/enroll", authenticateUser, enrollInCourse);
router.get("/my-courses", authenticateUser, getMyEnrollments);
router.get("/my", authenticateUser, getMyEnrollments);
router.put("/progress", authenticateUser, updateProgress);

module.exports = router;
