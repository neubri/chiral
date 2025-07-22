const express = require("express");
const NoteController = require("../controllers/noteController");
const { authenticateToken } = require("../middlewares/authentication");

const router = express.Router();

// All note routes require authentication
router.use(authenticateToken);

router.post("/", NoteController.createNote);
router.get("/", NoteController.getNotes);
router.get("/export/pdf", NoteController.exportToPDF);
router.get("/:id/markdown", NoteController.getNoteMarkdown);
router.get("/:id", NoteController.getNoteById);
router.put("/:id", NoteController.updateNote);
router.delete("/:id", NoteController.deleteNote);

module.exports = router;
