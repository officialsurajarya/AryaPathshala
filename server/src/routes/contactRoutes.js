const express = require("express");
const router = express.Router();
const {
  submitMessage,
  getMessages,
  updateStatus,
  deleteMessage,
} = require("../controllers/contactController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const { contactLimiter } = require("../middleware/rateLimiter");

router.post("/", contactLimiter, submitMessage);
router.get("/", authenticateUser, authorizeRoles("ADMIN"), getMessages);
router.put("/:id/status", authenticateUser, authorizeRoles("ADMIN"), updateStatus);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteMessage);

module.exports = router;
