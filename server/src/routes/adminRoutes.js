const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
  updateUserRole,
  enrollStudentInCourse,
  updateEnrollment,
  deleteEnrollment,
  getAllEnrollments,
} = require("../controllers/adminController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

// All admin routes require ADMIN role
router.use(authenticateUser, authorizeRoles("ADMIN"));

// Dashboard Statistics
router.get("/stats", getDashboardStats);

// Student / User Management CRUD
router.get("/users", getAllUsers);
router.post("/users", createUser);
router.get("/users/:id", getUserById);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);
router.put("/users/:id/role", updateUserRole);

// Student Course Enrollment Management
router.get("/enrollments", getAllEnrollments);
router.post("/users/:id/enroll", enrollStudentInCourse);
router.put("/enrollments/:id", updateEnrollment);
router.delete("/enrollments/:id", deleteEnrollment);

module.exports = router;
