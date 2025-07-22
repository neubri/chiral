const express = require("express");
const GeminiController = require("../controllers/geminiController");
const { authenticateToken } = require("../middlewares/authentication");

const router = express.Router();

// All Gemini AI routes require authentication
router.use(authenticateToken);

router.post("/explain", GeminiController.explainText);
router.post("/suggestions", GeminiController.generateLearningPath);
router.post("/quiz", GeminiController.generateQuiz);
router.post("/summarize", GeminiController.summarizeContent);

module.exports = router;
