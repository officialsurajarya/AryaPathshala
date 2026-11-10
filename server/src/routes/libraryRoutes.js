const express = require("express");
const router = express.Router();
const {
  getBooks,
  getBookById,
  recordDownload,
  recordView,
} = require("../controllers/libraryController");

router.get("/", getBooks);
router.get("/:id", getBookById);
router.post("/:id/download", recordDownload);
router.post("/:id/view", recordView);

module.exports = router;
