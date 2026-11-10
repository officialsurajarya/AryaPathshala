const express = require("express");
const router = express.Router();
const {
  submitMessage,
  getMessages,
  updateStatus,
} = require("../controllers/contactController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const { contactLimiter } = require("../middleware/rateLimiter");

router.post("/", contactLimiter, submitMessage);
router.get("/", authenticateUser, authorizeRoles("ADMIN"), getMessages);
router.put("/:id/status", authenticateUser, authorizeRoles("ADMIN"), updateStatus);

module.exports = router;
