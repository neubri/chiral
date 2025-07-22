const express = require("express");
const ArticleController = require("../controllers/articleController");
const { authenticateToken } = require("../middlewares/authentication");

const router = express.Router();

// All article routes require authentication
router.use(authenticateToken);

router.get("/recommendations", ArticleController.getRecommendations);
router.get("/search", ArticleController.searchArticles);
router.get("/devto/:id", ArticleController.getDevToArticle);
router.post("/save", ArticleController.saveArticle);
router.get("/saved", ArticleController.getSavedArticles);
router.delete("/saved/:id", ArticleController.deleteSavedArticle);

module.exports = router;
