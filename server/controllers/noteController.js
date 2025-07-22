const { Note, Article, User } = require("../models");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

class NoteController {
  static async createNote(req, res, next) {
    try {
      const {
        articleId,
        highlightedText,
        explanation,
        originalContext,
        markdownContent,
      } = req.body;

      if (!highlightedText) {
        throw { name: "Bad Request", message: "Highlighted text is required" };
      }

      if (!explanation) {
        throw { name: "Bad Request", message: "Explanation is required" };
      }

      // Generate markdown content if not provided
      const markdown =
        markdownContent ||
        `
# Highlighted Note

**Highlighted Text:** ${highlightedText}

**Context:** ${originalContext || "No context provided"}

## Explanation

${explanation}

---
*Created on: ${new Date().toLocaleString("id-ID")}*
`;

      const note = await Note.create({
        userId: req.user.id,
        articleId: articleId || null,
        highlightedText,
        explanation,
        originalContext: originalContext || null,
        markdownContent: markdown,
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
      const { page = 1, limit = 10, articleId } = req.query;
      const offset = (page - 1) * limit;

      const where = { userId: req.user.id };
      if (articleId) {
        where.articleId = articleId;
      }

      const notes = await Note.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [["createdAt", "DESC"]],
        include: [
          {
            model: Article,
            attributes: ["id", "title", "url", "author"],
          },
        ],
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
        include: [
          {
            model: Article,
            attributes: ["id", "title", "url", "author"],
          },
        ],
      });

      if (!note) {
        throw { name: "Not Found", message: "Note not found" };
      }

      res.json(note);
    } catch (error) {
      next(error);
    }
  }

  static async updateNote(req, res, next) {
    try {
      const { id } = req.params;
      const { highlightedText, explanation, originalContext, markdownContent } =
        req.body;

      const note = await Note.findOne({
        where: {
          id,
          userId: req.user.id,
        },
      });

      if (!note) {
        throw { name: "Not Found", message: "Note not found" };
      }

      // Update fields if provided
      if (highlightedText) note.highlightedText = highlightedText;
      if (explanation) note.explanation = explanation;
      if (originalContext !== undefined) note.originalContext = originalContext;
      if (markdownContent) note.markdownContent = markdownContent;

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

  static async getNoteMarkdown(req, res, next) {
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

      res.set("Content-Type", "text/markdown");
      res.send(note.markdownContent);
    } catch (error) {
      next(error);
    }
  }

  static async exportToPDF(req, res, next) {
    try {
      const { noteIds } = req.query; // Comma-separated note IDs

      let notes;
      if (noteIds) {
        const ids = noteIds.split(",").map((id) => parseInt(id));
        notes = await Note.findAll({
          where: {
            id: ids,
            userId: req.user.id,
          },
          include: [
            {
              model: Article,
              attributes: ["title", "author", "url"],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
      } else {
        // Export all user's notes
        notes = await Note.findAll({
          where: { userId: req.user.id },
          include: [
            {
              model: Article,
              attributes: ["title", "author", "url"],
            },
          ],
          order: [["createdAt", "DESC"]],
        });
      }

      if (!notes.length) {
        throw { name: "Not Found", message: "No notes found" };
      }

      // Create PDF
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      let page = pdfDoc.addPage();
      const { width, height } = page.getSize();
      let yPosition = height - 50;

      // Add title
      page.drawText("Learning Notes Export", {
        x: 50,
        y: yPosition,
        size: 20,
        font: boldFont,
        color: rgb(0, 0, 0),
      });

      yPosition -= 40;

      // Add export date
      page.drawText(`Exported on: ${new Date().toLocaleString("id-ID")}`, {
        x: 50,
        y: yPosition,
        size: 10,
        font: font,
        color: rgb(0.5, 0.5, 0.5),
      });

      yPosition -= 30;

      // Add notes (similar to previous implementation)
      for (const note of notes) {
        // Check if we need a new page
        if (yPosition < 150) {
          page = pdfDoc.addPage();
          yPosition = height - 50;
        }

        // Note content (simplified for this example)
        page.drawText(`Highlighted Text: ${note.highlightedText}`, {
          x: 50,
          y: yPosition,
          size: 12,
          font: boldFont,
          color: rgb(0, 0, 0),
        });

        yPosition -= 40;
      }

      const pdfBytes = await pdfDoc.save();

      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="learning-notes-${Date.now()}.pdf"`,
      });

      res.send(Buffer.from(pdfBytes));
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NoteController;
