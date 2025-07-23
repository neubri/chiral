if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");

const authController = require("./controllers/authController");
const noteController = require("./controllers/noteController");
const geminiController = require("./controllers/geminiController");
const highlightController = require("./controllers/highlightController");
const errorHandler = require("./middlewares/errorHandler");
const pubController = require("./controllers/pubController");
const authentication = require("./middlewares/authentication");

const app = express();

// Global middlewares
app.use(cors());
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.json({ limit: "10mb" }));

//router
const router = express.Router();

// PUBLIC ROUTES
router.get("/health", pubController.getHealthCheck);
router.get("/articles", pubController.getPublicArticles);
router.get("/articles/:id", pubController.getArticleDetail);

// AUTHENTICATION ROUTES
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);
router.post("/google-login", authController.googleLogin);

// PROTECTED ROUTES (Require Authentication)
router.use(authentication.authenticateToken);

// User Profile Management
router.get("/auth/profile", authController.getProfile);
router.put("/auth/interests", authController.updateInterests);

// Articles with User Context
router.get("/my-articles", pubController.getArticlesByInterests);

// Notes Management (Core Feature)
router.post("/notes", noteController.createNote);
router.get("/notes", noteController.getNotes);
router.get("/notes/:id", noteController.getNoteById);
router.put("/notes/:id", noteController.updateNote);
router.delete("/notes/:id", noteController.deleteNote);

// Highlights Management (New Feature)
router.post("/highlights", highlightController.createHighlight);
router.get("/highlights", highlightController.getHighlights);
router.get("/highlights/:id", highlightController.getHighlightById);
router.put("/highlights/:id", highlightController.updateHighlight);
router.delete("/highlights/:id", highlightController.deleteHighlight);
router.post("/highlights/:id/explain", highlightController.explainHighlight);
router.get(
  "/articles/:articleId/highlights",
  highlightController.getArticleHighlights
);

// AI Explain (Core Feature)
router.post("/gemini/explain", geminiController.explainText);

app.get("/", pubController.getHealthCheck);
app.use("/api", router);

app.use(errorHandler);

module.exports = app;
