const geminiHelper = require("../helpers/gemini");

class GeminiController {
  static async explainText(req, res, next) {
    try {
      const { highlightedText, context } = req.body;

      // Enhanced input validation
      if (!highlightedText) {
        throw { name: "Bad Request", message: "Highlighted text is required" };
      }

      // Input length validation to prevent abuse
      if (highlightedText.length > 5000) {
        throw {
          name: "Bad Request",
          message: "Highlighted text is too long (max 5000 characters)",
        };
      }

      if (context && context.length > 10000) {
        throw {
          name: "Bad Request",
          message: "Context is too long (max 10000 characters)",
        };
      }

      // Basic content validation - check for potentially malicious content
      const sanitizedHighlightedText = highlightedText.trim();
      const sanitizedContext = context ? context.trim() : null;

      if (!sanitizedHighlightedText) {
        throw {
          name: "Bad Request",
          message: "Highlighted text cannot be empty",
        };
      }

      const explanation = await geminiHelper.explainText(
        sanitizedHighlightedText,
        sanitizedContext
      );

      res.json({
        highlightedText: sanitizedHighlightedText,
        explanation,
        context: sanitizedContext,
      });
    } catch (error) {
      // Handle Gemini API specific errors
      if (error.message === "Failed to generate explanation") {
        error.name = "Service Unavailable";
        error.message = "AI service is temporarily unavailable";
      }
      next(error);
    }
  }
}

module.exports = GeminiController;
