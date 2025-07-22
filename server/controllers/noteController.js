const { Note } = require("../models");

class NoteController {
  // Helper function to clean note response (remove legacy fields)
  static cleanNoteResponse(note) {
    return {
      id: note.id,
      userId: note.userId,
      highlightedText: note.highlightedText,
      explanation: note.explanation,
      originalContext: note.originalContext,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
  static async createNote(req, res, next) {
    try {
      const { highlightedText, explanation, originalContext } = req.body;

      // Enhanced input validation
      if (!highlightedText) {
        throw { name: "Bad Request", message: "Highlighted text is required" };
      }

      if (!explanation) {
        throw { name: "Bad Request", message: "Explanation is required" };
      }

      // Length validation to prevent abuse
      if (highlightedText.length > 5000) {
        throw {
          name: "Bad Request",
          message: "Highlighted text is too long (max 5000 characters)",
        };
      }

      if (explanation.length > 10000) {
        throw {
          name: "Bad Request",
          message: "Explanation is too long (max 10000 characters)",
        };
      }

      if (originalContext && originalContext.length > 10000) {
        throw {
          name: "Bad Request",
          message: "Original context is too long (max 10000 characters)",
        };
      }

      // Trim whitespace
      const sanitizedHighlightedText = highlightedText.trim();
      const sanitizedExplanation = explanation.trim();
      const sanitizedOriginalContext = originalContext
        ? originalContext.trim()
        : null;

      const note = await Note.create({
        userId: req.user.id,
        highlightedText: sanitizedHighlightedText,
        explanation: sanitizedExplanation,
        originalContext: sanitizedOriginalContext,
      });

      res.status(201).json({
        message: "Note created successfully",
        note: NoteController.cleanNoteResponse(note),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNotes(req, res, next) {
    try {
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const notes = await Note.findAndCountAll({
        where: { userId: req.user.id },
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "DESC"]],
      });

      res.json({
        notes: notes.rows.map((note) => NoteController.cleanNoteResponse(note)),
        total: notes.count,
        currentPage: parseInt(page),
        totalPages: Math.ceil(notes.count / limit),
      });
    } catch (error) {
      next(error);
    }
  }

  static async getNoteById(req, res, next) {
    try {
      const { id } = req.params;

      const note = await Note.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!note) {
        throw { name: "Not Found", message: "Note not found" };
      }

      res.json({ note: NoteController.cleanNoteResponse(note) });
    } catch (error) {
      next(error);
    }
  }

  static async updateNote(req, res, next) {
    try {
      const { id } = req.params;
      const { highlightedText, explanation, originalContext } = req.body;

      const note = await Note.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!note) {
        throw { name: "Not Found", message: "Note not found" };
      }

      if (highlightedText) note.highlightedText = highlightedText;
      if (explanation) note.explanation = explanation;
      if (originalContext !== undefined) note.originalContext = originalContext;

      await note.save();

      res.json({
        message: "Note updated successfully",
        note: NoteController.cleanNoteResponse(note),
      });
    } catch (error) {
      next(error);
    }
  }

  static async deleteNote(req, res, next) {
    try {
      const { id } = req.params;

      const note = await Note.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!note) {
        throw { name: "Not Found", message: "Note not found" };
      }

      await note.destroy();

      res.json({ message: "Note deleted successfully" });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NoteController;
