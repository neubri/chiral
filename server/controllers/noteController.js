const { Note } = require("../models");

class NoteController {
  static async createNote(req, res, next) {
    try {
      const { highlightedText, explanation, originalContext } = req.body;

      if (!highlightedText) {
        throw { name: "Bad Request", message: "Highlighted text is required" };
      }

      if (!explanation) {
        throw { name: "Bad Request", message: "Explanation is required" };
      }

      const note = await Note.create({
        userId: req.user.id,
        highlightedText,
        explanation,
        originalContext: originalContext || null,
      });

      res.status(201).json({
        message: "Note created successfully",
        note,
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
        notes: notes.rows,
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

      res.json({ note });
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
        note,
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
