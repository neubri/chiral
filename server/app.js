if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const multer = require("multer");
const cors = require("cors");

const authController = require("./controllers/authController");
const articleController = require("./controllers/articleController");
const noteController = require("./controllers/noteController");
const geminiController = require("./controllers/geminiController");
const errorHandler = require("./middlewares/errorHandler");
const pubController = require("./controllers/pubController");
const authentication = require("./middlewares/authentication");

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

// Global middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//router
const router = express.Router();

//router pub
router.get("/health", pubController.getHealthCheck);
router.get("/articles", pubController.getPublicArticles);
router.get("/tags", pubController.getPublicTags);

//router auth
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/auth/google", authController.googleLogin);

//router user
router.use(authentication.authenticateToken);
router.put("/auth/interests", authController.updateInterests);
router.get("/auth/profile", authController.getProfile);

//router articles
router.get("/articles/recommendations", articleController.getRecommendations);
router.get("/articles/search", articleController.searchArticles);
router.get("/articles/devto/:id", articleController.getDevToArticle);
router.post("/articles/save", articleController.saveArticle);
router.get("/articles/saved", articleController.getSavedArticles);
router.delete("/articles/saved/:id", articleController.deleteSavedArticle);

//router notes
router.post("/notes", noteController.createNote);
router.get("/notes", noteController.getNotes);
router.get("/notes/export/pdf", noteController.exportToPDF);
router.get("/notes/:id", noteController.getNoteById);
router.put("/notes/:id", noteController.updateNote);
router.delete("/notes/:id", noteController.deleteNote);
router.get("/notes/:id/markdown", noteController.getNoteMarkdown);

//router gemini AI
router.post("/gemini/explain", geminiController.explainText);
router.post("/gemini/suggestions", geminiController.generateLearningPath);
router.post("/gemini/quiz", geminiController.generateQuiz);
router.post("/gemini/summarize", geminiController.summarizeContent);

app.get("/", pubController.getHealthCheck);
app.use("/api", router);

app.use(errorHandler);

module.exports = app;
