const axios = require("axios");

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
      const { tag = "programming", per_page = 10 } = req.query;

      const baseUrl = process.env.DEV_TO_API_URL || "https://dev.to/api";
      const response = await axios.get(`${baseUrl}/articles`, {
        params: {
          tag: tag.toLowerCase(),
          per_page: Math.min(per_page, 20),
          top: 7,
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
  static async getArticleDetail(req, res, next) {
    try {
      const { id } = req.params;

      if (!id) {
        throw { name: "Bad Request", message: "Article ID is required" };
      }

      const baseUrl = process.env.DEV_TO_API_URL || "https://dev.to/api";
      const response = await axios.get(`${baseUrl}/articles/${id}`);

      const article = response.data;

      // Enhanced article data for in-app reading experience
      const enhancedArticle = {
        id: article.id,
        title: article.title,
        description: article.description,
        body_markdown: article.body_markdown,
        body_html: article.body_html, // ✅ FULL CONTENT AVAILABLE!
        url: article.url,
        canonical_url: article.canonical_url,
        cover_image: article.cover_image,
        published_at: article.published_at,
        reading_time_minutes: article.reading_time_minutes,
        positive_reactions_count: article.positive_reactions_count,
        comments_count: article.comments_count,
        user: {
          name: article.user.name,
          username: article.user.username,
          profile_image: article.user.profile_image,
          website_url: article.user.website_url,
        },
        organization: article.organization,
        tag_list: article.tags || [], // tags is the array in dev.to API
        tags: article.tag_list, // tag_list is the string in dev.to API
        // Add metadata for highlighting support
        word_count: article.body_markdown
          ? article.body_markdown.split(" ").length
          : 0,
        char_count: article.body_markdown ? article.body_markdown.length : 0,
      };

      res.json({
        article: enhancedArticle,
        message: "Article content loaded successfully",
      });
    } catch (error) {
      if (error.response?.status === 404) {
        next({ name: "Not Found", message: "Article not found" });
      } else {
        next(error);
      }
    }
  }

  static async getArticlesByInterests(req, res, next) {
    try {
      // Get user's learning interests from authenticated user
      const userInterests = req.user?.learningInterests || ["programming"];
      const { per_page = 10 } = req.query;

      const baseUrl = process.env.DEV_TO_API_URL || "https://dev.to/api";

      // Fetch articles for each interest and combine
      const articlePromises = userInterests.slice(0, 3).map(
        (interest) =>
          axios
            .get(`${baseUrl}/articles`, {
              params: {
                tag: interest.toLowerCase(),
                per_page: Math.ceil(per_page / userInterests.length),
                top: 7,
              },
            })
            .catch(() => ({ data: [] })) // Handle failed requests gracefully
      );

      const responses = await Promise.all(articlePromises);
      const allArticles = responses.flatMap((response) => response.data || []);

      // Remove duplicates and shuffle
      const uniqueArticles = allArticles.filter(
        (article, index, self) =>
          index === self.findIndex((a) => a.id === article.id)
      );

      // Sort by published date and limit
      const sortedArticles = uniqueArticles
        .sort((a, b) => new Date(b.published_at) - new Date(a.published_at))
        .slice(0, per_page);

      res.json({
        articles: sortedArticles,
        total: sortedArticles.length,
        interests: userInterests,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = PubController;
