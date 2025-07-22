if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const cors = require("cors");

const authController = require("./controllers/authController");
const noteController = require("./controllers/noteController");
const geminiController = require("./controllers/geminiController");
const errorHandler = require("./middlewares/errorHandler");
const pubController = require("./controllers/pubController");
const authentication = require("./middlewares/authentication");

const app = express();

// Global middlewares
app.use(cors());
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

//router
const router = express.Router();

// ========================================
// PUBLIC ROUTES (No Authentication)
// ========================================
router.get("/health", pubController.getHealthCheck);
router.get("/articles", pubController.getPublicArticles);

// ========================================
// AUTHENTICATION ROUTES
// ========================================
router.post("/auth/register", authController.register);
router.post("/auth/login", authController.login);

// ========================================
// PROTECTED ROUTES (Require Authentication)
// ========================================
router.use(authentication.authenticateToken);

// User Profile Management
router.get("/auth/profile", authController.getProfile);
router.put("/auth/interests", authController.updateInterests);

// Notes Management (Core Feature)
router.post("/notes", noteController.createNote);
router.get("/notes", noteController.getNotes);
router.get("/notes/:id", noteController.getNoteById);
router.put("/notes/:id", noteController.updateNote);
router.delete("/notes/:id", noteController.deleteNote);

// AI Explain (Core Feature)
router.post("/gemini/explain", geminiController.explainText);

app.get("/", pubController.getHealthCheck);
app.use("/api", router);

app.use(errorHandler);

module.exports = app;
