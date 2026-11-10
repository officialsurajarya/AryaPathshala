const express = require("express");
const router = express.Router();
const {
  register,
  login,
  verifyEmail,
  forgotPassword,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
  logout,
} = require("../controllers/authController");
const { authenticateUser } = require("../middleware/authMiddleware");
const { authLimiter } = require("../middleware/rateLimiter");

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/verify-email", verifyEmail);
router.post("/forgot-password", authLimiter, forgotPassword);
router.post("/reset-password", resetPassword);

router.get("/profile", authenticateUser, getProfile);
router.put("/profile", authenticateUser, updateProfile);
router.put("/change-password", authenticateUser, changePassword);
router.post("/logout", authenticateUser, logout);

module.exports = router;
