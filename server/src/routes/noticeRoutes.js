const express = require("express");
const router = express.Router();
const {
  getNotices,
  createNotice,
  deleteNotice,
  updateNotice,
} = require("../controllers/noticeController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

router.get("/", getNotices);
router.post("/", authenticateUser, authorizeRoles("ADMIN", "TEACHER"), createNotice);
router.put("/:id", authenticateUser, authorizeRoles("ADMIN", "TEACHER"), updateNotice);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteNotice);

module.exports = router;
