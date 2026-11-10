const express = require("express");
const router = express.Router();
const {
  getDashboardStats,
  getAllUsers,
  updateUserRole,
  deleteUser,
} = require("../controllers/adminController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

// All admin routes require ADMIN role
router.use(authenticateUser, authorizeRoles("ADMIN"));

router.get("/stats", getDashboardStats);
router.get("/users", getAllUsers);
router.put("/users/:id/role", updateUserRole);
router.delete("/users/:id", deleteUser);

module.exports = router;
