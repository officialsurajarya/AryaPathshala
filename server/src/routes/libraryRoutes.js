const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  recordDownload,
  recordView,
  createBook,
  updateBook,
  deleteBook,
  toggleBookAvailability,
} = require("../controllers/libraryController");
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

// Public endpoints
router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/:id/download", recordDownload);
router.post("/:id/view", recordView);

// Admin-only CRUD operations
router.post("/", authenticateUser, authorizeRoles("ADMIN"), createBook);
router.put("/:id", authenticateUser, authorizeRoles("ADMIN"), updateBook);
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteBook);
router.patch("/:id/toggle", authenticateUser, authorizeRoles("ADMIN"), toggleBookAvailability);
router.put("/:id/toggle", authenticateUser, authorizeRoles("ADMIN"), toggleBookAvailability);

module.exports = router;
