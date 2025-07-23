const { Note } = require("../models");

class NoteController {
  // Helper function to clean note response (remove legacy fields)
  static cleanNoteResponse(note) {
    return {
      id: note.id,
      userId: note.userId,
      noteType: note.noteType,
      // Traditional note fields
      title: note.title,
      content: note.content,
      isFavorite: note.isFavorite,
      // Highlight note fields
      highlightedText: note.highlightedText,
      explanation: note.explanation,
      originalContext: note.originalContext,
      createdAt: note.createdAt,
      updatedAt: note.updatedAt,
    };
  }
  static async createNote(req, res, next) {
    try {
      const {
        noteType = "traditional",
        title,
        content,
        isFavorite = false,
        highlightedText,
        explanation,
        originalContext,
      } = req.body;

      // Validation based on note type
      if (noteType === "traditional") {
        if (!title) {
          throw {
            name: "Bad Request",
            message: "Title is required for traditional notes",
          };
        }
        if (!content) {
          throw {
            name: "Bad Request",
            message: "Content is required for traditional notes",
          };
        }
      } else if (noteType === "highlight") {
        if (!highlightedText) {
          throw {
            name: "Bad Request",
            message: "Highlighted text is required for highlight notes",
          };
        }
        if (!explanation) {
          throw {
            name: "Bad Request",
            message: "Explanation is required for highlight notes",
          };
        }
      }

      // Length validation to prevent abuse
      if (title && title.length > 200) {
        throw {
          name: "Bad Request",
          message: "Title is too long (max 200 characters)",
        };
      }

      if (content && content.length > 50000) {
        throw {
          name: "Bad Request",
          message: "Content is too long (max 50000 characters)",
        };
      }

      if (highlightedText && highlightedText.length > 5000) {
        throw {
          name: "Bad Request",
          message: "Highlighted text is too long (max 5000 characters)",
        };
      }

      if (explanation && explanation.length > 10000) {
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

      // Prepare note data based on type
      const noteData = {
        userId: req.user.id,
        noteType,
        isFavorite,
      };

      if (noteType === "traditional") {
        noteData.title = title.trim();
        noteData.content = content.trim();
      } else if (noteType === "highlight") {
        noteData.highlightedText = highlightedText.trim();
        noteData.explanation = explanation.trim();
        noteData.originalContext = originalContext
          ? originalContext.trim()
          : null;
      }

      const note = await Note.create(noteData);

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
      const {
        title,
        content,
        isFavorite,
        highlightedText,
        explanation,
        originalContext,
      } = req.body;

      const note = await Note.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!note) {
        throw { name: "Not Found", message: "Note not found" };
      }

      // Update fields based on note type
      if (note.noteType === "traditional") {
        if (title !== undefined) note.title = title;
        if (content !== undefined) note.content = content;
      } else if (note.noteType === "highlight") {
        if (highlightedText !== undefined)
          note.highlightedText = highlightedText;
        if (explanation !== undefined) note.explanation = explanation;
        if (originalContext !== undefined)
          note.originalContext = originalContext;
      }

      // isFavorite can be updated for both types
      if (isFavorite !== undefined) note.isFavorite = isFavorite;

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
