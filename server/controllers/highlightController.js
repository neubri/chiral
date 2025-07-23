const { Highlight, User } = require("../models");
const geminiHelper = require("../helpers/gemini");

class HighlightController {
  // Helper function to clean highlight response
  static cleanHighlightResponse(highlight) {
    return {
      id: highlight.id,
      userId: highlight.userId,
      articleId: highlight.articleId,
      articleTitle: highlight.articleTitle,
      articleUrl: highlight.articleUrl,
      highlightedText: highlight.highlightedText,
      explanation: highlight.explanation,
      context: highlight.context,
      position: highlight.position,
      tags: highlight.tags,
      isBookmarked: highlight.isBookmarked,
      createdAt: highlight.createdAt,
      updatedAt: highlight.updatedAt,
    };
  }

  static async createHighlight(req, res, next) {
    try {
      const {
        articleId,
        articleTitle,
        articleUrl,
        highlightedText,
        context,
        position,
        tags,
        autoExplain = true,
      } = req.body;

      // Input validation
      if (!articleId) {
        throw { name: "Bad Request", message: "Article ID is required" };
      }

      if (!highlightedText) {
        throw { name: "Bad Request", message: "Highlighted text is required" };
      }

      // Length validation
      if (highlightedText.length > 5000) {
        throw {
          name: "Bad Request",
          message: "Highlighted text is too long (max 5000 characters)",
        };
      }

      // Sanitize inputs
      const sanitizedHighlightedText = highlightedText.trim();
      const sanitizedContext = context ? context.trim() : null;

      let explanation = null;

      // Auto-generate explanation if requested
      if (autoExplain) {
        try {
          explanation = await geminiHelper.explainText(
            sanitizedHighlightedText,
            sanitizedContext
          );
        } catch (error) {
          console.warn("Failed to generate explanation:", error.message);
          // Continue without explanation rather than failing the whole request
        }
      }

      const highlight = await Highlight.create({
        userId: req.user.id,
        articleId: articleId.toString(),
        articleTitle: articleTitle || null,
        articleUrl: articleUrl || null,
        highlightedText: sanitizedHighlightedText,
        explanation,
        context: sanitizedContext,
        position: position || null,
        tags: tags || null,
        isBookmarked: false,
      });

      res.status(201).json({
        message: "Highlight created successfully",
        highlight: HighlightController.cleanHighlightResponse(highlight),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHighlights(req, res, next) {
    try {
      const {
        page = 1,
        limit = 20,
        articleId,
        isBookmarked,
        search,
      } = req.query;

      const offset = (page - 1) * limit;
      const where = { userId: req.user.id };

      // Filter by article if specified
      if (articleId) {
        where.articleId = articleId.toString();
      }

      // Filter by bookmark status if specified
      if (isBookmarked !== undefined) {
        where.isBookmarked = isBookmarked === "true";
      }

      // Search in highlighted text and explanation
      if (search) {
        const { Op } = require("sequelize");
        where[Op.or] = [
          { highlightedText: { [Op.iLike]: `%${search}%` } },
          { explanation: { [Op.iLike]: `%${search}%` } },
          { articleTitle: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const highlights = await Highlight.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      res.json({
        highlights: highlights.rows.map((highlight) =>
          HighlightController.cleanHighlightResponse(highlight)
        ),
        total: highlights.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(highlights.count / limit),
        filters: { articleId, isBookmarked, search },
      });
    } catch (error) {
      next(error);
    }
  }

  static async getHighlightById(req, res, next) {
    try {
      const { id } = req.params;

      const highlight = await Highlight.findOne({
        where: {
          id: id,
          userId: req.user.id,
        },
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      if (!highlight) {
        throw { name: "Not Found", message: "Highlight not found" };
      }

      res.json({
        highlight: HighlightController.cleanHighlightResponse(highlight),
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateHighlight(req, res, next) {
    try {
      const { id } = req.params;
      const { explanation, tags, isBookmarked } = req.body;

      const highlight = await Highlight.findOne({
        where: {
          id: id,
          userId: req.user.id,
        },
      });

      if (!highlight) {
        throw { name: "Not Found", message: "Highlight not found" };
      }

      // Update allowed fields
      if (explanation !== undefined) {
        highlight.explanation = explanation;
      }
      if (tags !== undefined) {
        highlight.tags = tags;
      }
      if (isBookmarked !== undefined) {
        highlight.isBookmarked = isBookmarked;
      }

      await highlight.save();

      res.json({
        message: "Highlight updated successfully",
        highlight: HighlightController.cleanHighlightResponse(highlight),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteHighlight(req, res, next) {
    try {
      const { id } = req.params;

      const highlight = await Highlight.findOne({
        where: {
          id: id,
          userId: req.user.id,
        },
      });

      if (!highlight) {
        throw { name: "Not Found", message: "Highlight not found" };
      }

      await highlight.destroy();

      res.json({
        message: "Highlight deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  static async explainHighlight(req, res, next) {
    try {
      const { id } = req.params;
      const { regenerate = false } = req.query;

      const highlight = await Highlight.findOne({
        where: {
          id: id,
          userId: req.user.id,
        },
      });

      if (!highlight) {
        throw { name: "Not Found", message: "Highlight not found" };
      }

      // If explanation exists and not regenerating, return existing
      if (highlight.explanation && !regenerate) {
        return res.json({
          highlightedText: highlight.highlightedText,
          explanation: highlight.explanation,
          context: highlight.context,
        });
      }

      // Generate new explanation
      const explanation = await geminiHelper.explainText(
        highlight.highlightedText,
        highlight.context
      );

      // Update highlight with new explanation
      highlight.explanation = explanation;
      await highlight.save();

      res.json({
        highlightedText: highlight.highlightedText,
        explanation,
        context: highlight.context,
        message: regenerate
          ? "Explanation regenerated"
          : "Explanation generated",
      });
    } catch (error) {
      next(error);
    }
  }

  static async getArticleHighlights(req, res, next) {
    try {
      const { articleId } = req.params;

      const highlights = await Highlight.findAll({
        where: {
          articleId: articleId.toString(),
          userId: req.user.id,
        },
        order: [["createdAt", "ASC"]],
        include: [
          {
            model: User,
            as: "user",
            attributes: ["id", "name", "email"],
          },
        ],
      });

      res.json({
        highlights: highlights.map((highlight) =>
          HighlightController.cleanHighlightResponse(highlight)
        ),
        articleId,
        total: highlights.length,
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = HighlightController;
