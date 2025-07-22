// Public Controller untuk endpoints yang tidak memerlukan authentication
class PubController {
  static async getHealthCheck(req, res) {
    res.json({
      message: "Chiral server is running!",
      timestamp: new Date().toISOString(),
      version: "1.0.0",
    });
  }

  static async getPublicArticles(req, res, next) {
    try {
      const axios = require("axios");
      const { tag = "programming", per_page = 10 } = req.query;

      const response = await axios.get("https://dev.to/api/articles", {
        params: {
          tag: tag.toLowerCase(),
          per_page: Math.min(per_page, 20), // Limit to 20
          top: 7, // Last 7 days
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

  static async getPublicTags(req, res, next) {
    try {
      const axios = require("axios");

      const response = await axios.get("https://dev.to/api/tags", {
        params: {
          per_page: 50,
        },
      });

      res.json({
        tags: response.data,
        total: response.data.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PubController;
