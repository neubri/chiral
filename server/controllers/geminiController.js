const geminiHelper = require("../helpers/gemini");

class GeminiController {
  static async explainText(req, res, next) {
    try {
      const { highlightedText, context } = req.body;

      if (!highlightedText) {
        throw { name: "Bad Request", message: "Highlighted text is required" };
      }

      const explanation = await geminiHelper.explainText(
        highlightedText,
        context
      );

      res.json({
        highlightedText,
        explanation,
        context: context || null,
      });
    } catch (error) {
      next(error);
    }
  }

  static async generateLearningPath(req, res, next) {
    try {
      const { topic, currentLevel } = req.body;

      if (!topic) {
        throw { name: "Bad Request", message: "Topic is required" };
      }

      const suggestions = await geminiHelper.generateLearningPath(
        topic,
        currentLevel
      );

      res.json(suggestions);
    } catch (error) {
      next(error);
    }
  }

  static async generateQuiz(req, res, next) {
    try {
      const { content, difficulty = "easy" } = req.body;

      if (!content) {
        throw { name: "Bad Request", message: "Content is required" };
      }

      const quiz = await geminiHelper.generateQuiz(content, difficulty);

      res.json(quiz);
    } catch (error) {
      next(error);
    }
  }

  static async summarizeContent(req, res, next) {
    try {
      const { content, length = "medium" } = req.body;

      if (!content) {
        throw { name: "Bad Request", message: "Content is required" };
      }

      const summary = await geminiHelper.summarizeContent(content, length);

      res.json(summary);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = GeminiController;
