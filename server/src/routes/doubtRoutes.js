const express = require("express");
const router = express.Router();
const {
  getAllDoubts,
  createDoubt,
  replyDoubt,
  deleteDoubt,
} = require("../controllers/doubtController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

// All doubt operations require authentication
router.use(authenticateUser);

router.get("/", getAllDoubts);
router.post("/", createDoubt);
router.put("/:id/reply", authorizeRoles("TEACHER", "ADMIN"), replyDoubt);
router.delete("/:id", authorizeRoles("TEACHER", "ADMIN"), deleteDoubt);

module.exports = router;

