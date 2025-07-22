const axios = require("axios");
const { Article, User } = require("../models");

class ArticleController {
  static async getRecommendations(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id);
      if (!user || !user.learningInterests.length) {
        const error = new Error("No learning interests set");
        error.name = "Bad Request";
        throw error;
      }

      const articles = [];

      // Fetch articles for each learning interest
      for (const interest of user.learningInterests) {
        try {
          const response = await axios.get("https://dev.to/api/articles", {
            params: {
              tag: interest.toLowerCase(),
              per_page: 10,
              top: 7, // Last 7 days
            },
            headers: {
              "api-key": process.env.DEV_TO_API_KEY || "",
            },
          });

          articles.push(...response.data);
        } catch (error) {
          console.error(
            `Error fetching articles for ${interest}:`,
            error.message
          );
        }
      }

      // Remove duplicates and sort by published date
      const uniqueArticles = articles
        .filter(
          (article, index, self) =>
            index === self.findIndex((a) => a.id === article.id)
        )
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

      res.json({
        articles: uniqueArticles.slice(0, 20), // Limit to 20 articles
        total: uniqueArticles.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async searchArticles(req, res, next) {
    try {
      const { q, tag, per_page = 10 } = req.query;

      if (!q && !tag) {
        const error = new Error("Query or tag parameter is required");
        error.name = "Bad Request";
        throw error;
      }

      const params = {
        per_page: Math.min(per_page, 50), // Limit to 50
      };

      if (q) params.q = q;
      if (tag) params.tag = tag;

      const response = await axios.get("https://dev.to/api/articles", {
        params,
        headers: {
          "api-key": process.env.DEV_TO_API_KEY || "",
        },
      });

      res.json({
        articles: response.data,
        total: response.data.length,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getDevToArticle(req, res, next) {
    try {
      const { id } = req.params;

      const response = await axios.get(`https://dev.to/api/articles/${id}`, {
        headers: {
          "api-key": process.env.DEV_TO_API_KEY || "",
        },
      });

      res.json(response.data);
    } catch (error) {
      if (error.response && error.response.status === 404) {
        const customError = new Error("Article not found");
        customError.name = "Not Found";
        next(customError);
      } else {
        next(error);
      }
    }
  }

  static async saveArticle(req, res, next) {
    try {
      const { title, url, content, author, publishedAt, tags, devToId } =
        req.body;

      // Check if article already saved by user
      const existingArticle = await Article.findOne({
        where: {
          userId: req.user.id,
          devToId: devToId,
        },
      });

      if (existingArticle) {
        const error = new Error("Article already saved");
        error.name = "Bad Request";
        throw error;
      }

      const article = await Article.create({
        userId: req.user.id,
        title,
        url,
        content,
        author,
        publishedAt: new Date(publishedAt),
        tags: Array.isArray(tags) ? tags.join(",") : tags,
        devToId,
      });

      res.status(201).json({
        message: "Article saved successfully",
        article,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getSavedArticles(req, res, next) {
    try {
      const { page = 1, limit = 10 } = req.query;
      const offset = (page - 1) * limit;

      const articles = await Article.findAndCountAll({
        where: { userId: req.user.id },
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            attributes: ["id", "name", "email"],
          },
        ],
      });

      res.json({
        articles: articles.rows,
        total: articles.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(articles.count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteSavedArticle(req, res, next) {
    try {
      const { id } = req.params;

      const article = await Article.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!article) {
        const error = new Error("Article not found");
        error.name = "Not Found";
        throw error;
      }

      await article.destroy();

      res.json({ message: "Article deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ArticleController;
