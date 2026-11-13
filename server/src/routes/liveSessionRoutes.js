const express = require("express");
const router = express.Router();
const {
  getAllLiveSessions,
  createLiveSession,
  updateLiveSession,
  deleteLiveSession,
} = require("../controllers/liveSessionController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

// Public / Authenticated route: view all sessions
router.get("/", getAllLiveSessions);

// Teacher and Admin routes
router.post(
  "/",
  authenticateUser,
  authorizeRoles("TEACHER", "ADMIN"),
  createLiveSession
);
router.put(
  "/:id",
  authenticateUser,
  authorizeRoles("TEACHER", "ADMIN"),
  updateLiveSession
);
router.delete(
  "/:id",
  authenticateUser,
  authorizeRoles("TEACHER", "ADMIN"),
  deleteLiveSession
);

module.exports = router;

