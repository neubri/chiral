const request = require("supertest");
const app = require("../app");
const { User, Note } = require("../models");
const TestHelpers = require("./utils/testHelpers");

describe("Notes Management", () => {
  let testUser;
  let authToken;
  let testNote;

  beforeAll(async () => {
    // Clean up
    await TestHelpers.cleanupAllTestData();

    // Create authenticated user using TestHelpers
    const { user, token } = await TestHelpers.createAuthenticatedUser({
      email: "test@example.com",
      password: "password123",
    });
    testUser = user;
    authToken = token;
  });

  afterAll(async () => {
    // Clean up
    await TestHelpers.cleanupAllTestData();
  });

  beforeEach(async () => {
    // Clean up notes before each test
    await Note.destroy({ where: {} });
  });

  describe("POST /api/notes", () => {
    it("should create a new note successfully", async () => {
      const noteData = {
        title: "Test Note",
        content: "This is a test note content",
        isFavorite: false,
      };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(noteData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Note created successfully"
      );
      expect(response.body.note).toHaveProperty("id");
      expect(response.body.note).toHaveProperty("title", noteData.title);
      expect(response.body.note).toHaveProperty("content", noteData.content);
      expect(response.body.note).toHaveProperty(
        "isFavorite",
        noteData.isFavorite
      );
      expect(response.body.note).toHaveProperty("userId", testUser.id);

      testNote = response.body.note;
    });

    it("should create a note with default values", async () => {
      const noteData = {
        title: "Simple Note",
        content: "Simple content",
      };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(noteData);

      expect(response.status).toBe(201);
      expect(response.body.note).toHaveProperty("isFavorite", false);
    });

    it("should return error without authentication", async () => {
      const noteData = {
        title: "Test Note",
        content: "This is a test note content",
      };

      const response = await request(app).post("/api/notes").send(noteData);

      expect(response.status).toBe(401);
    });

    it("should return error with missing required fields", async () => {
      const noteData = {
        title: "Test Note",
        // missing content
      };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(noteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error with empty title", async () => {
      const noteData = {
        title: "",
        content: "This is content",
      };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(noteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error with empty content", async () => {
      const noteData = {
        title: "Test Note",
        content: "",
      };

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send(noteData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/notes", () => {
    beforeEach(async () => {
      // Create test notes with proper noteType
      await Note.bulkCreate([
        {
          userId: testUser.id,
          title: "Note 1",
          content: "Content 1",
          isFavorite: true,
          noteType: "traditional",
          createdAt: new Date("2025-01-01"),
        },
        {
          userId: testUser.id,
          title: "Note 2",
          content: "Content 2",
          isFavorite: false,
          noteType: "traditional",
          createdAt: new Date("2025-01-02"),
        },
        {
          userId: testUser.id,
          title: "Note 3",
          content: "Content 3",
          isFavorite: true,
          noteType: "traditional",
          createdAt: new Date("2025-01-03"),
        },
      ]);
    });

    it("should get all user notes", async () => {
      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("notes");
      expect(response.body.notes).toHaveLength(3);
      expect(response.body).toHaveProperty("total", 3);
      expect(response.body).toHaveProperty("currentPage", 1);
      expect(response.body).toHaveProperty("totalPages", 1);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/notes?page=1&limit=2")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notes).toHaveLength(2);
      expect(response.body).toHaveProperty("total", 3);
      expect(response.body).toHaveProperty("currentPage", 1);
      expect(response.body).toHaveProperty("totalPages", 2);
    });

    it("should support search functionality", async () => {
      const response = await request(app)
        .get("/api/notes?search=Note 1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notes).toHaveLength(1);
      expect(response.body.notes[0]).toHaveProperty("title", "Note 1");
    });

    it("should filter by favorites", async () => {
      const response = await request(app)
        .get("/api/notes?isFavorite=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.notes).toHaveLength(2);
      expect(response.body.notes.every((note) => note.isFavorite)).toBe(true);
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/notes");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/notes/:id", () => {
    beforeEach(async () => {
      testNote = await TestHelpers.createTestNote(testUser.id, {
        title: "Test Note",
        content: "Test Content",
        isFavorite: false,
      });
    });

    it("should get note by ID", async () => {
      const response = await request(app)
        .get(`/api/notes/${testNote.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.note).toHaveProperty("id", testNote.id);
      expect(response.body.note).toHaveProperty("title", "Test Note");
      expect(response.body.note).toHaveProperty("content", "Test Content");
    });

    it("should return error for non-existent note", async () => {
      const response = await request(app)
        .get("/api/notes/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get(`/api/notes/${testNote.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/notes/:id", () => {
    beforeEach(async () => {
      testNote = await TestHelpers.createTestNote(testUser.id, {
        title: "Test Note",
        content: "Test Content",
        isFavorite: false,
      });
    });

    it("should update note successfully", async () => {
      const updateData = {
        title: "Updated Note",
        content: "Updated Content",
        isFavorite: true,
      };

      const response = await request(app)
        .put(`/api/notes/${testNote.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Note updated successfully"
      );
      expect(response.body.note).toHaveProperty("title", updateData.title);
      expect(response.body.note).toHaveProperty("content", updateData.content);
      expect(response.body.note).toHaveProperty(
        "isFavorite",
        updateData.isFavorite
      );
    });

    it("should update only provided fields", async () => {
      const updateData = {
        title: "Updated Title Only",
      };

      const response = await request(app)
        .put(`/api/notes/${testNote.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body.note).toHaveProperty("title", updateData.title);
      expect(response.body.note).toHaveProperty("content", "Test Content"); // unchanged
    });

    it("should return error for non-existent note", async () => {
      const response = await request(app)
        .put("/api/notes/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ title: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app)
        .put(`/api/notes/${testNote.id}`)
        .send({ title: "Updated" });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/notes/:id", () => {
    beforeEach(async () => {
      testNote = await TestHelpers.createTestNote(testUser.id, {
        title: "Test Note",
        content: "Test Content",
        isFavorite: false,
      });
    });

    it("should delete note successfully", async () => {
      const response = await request(app)
        .delete(`/api/notes/${testNote.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Note deleted successfully"
      );

      // Verify note is deleted
      const deletedNote = await Note.findByPk(testNote.id);
      expect(deletedNote).toBeNull();
    });

    it("should return error for non-existent note", async () => {
      const response = await request(app)
        .delete("/api/notes/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).delete(`/api/notes/${testNote.id}`);

      expect(response.status).toBe(401);
    });
  });

  describe("Additional Note Tests", () => {
    it("should create note with highlight type", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          highlightedText: "Important text",
          explanation: "This is important",
          originalContext: "From article ABC",
          noteType: "highlight",
        });

      expect(response.status).toBe(201);
      expect(response.body.note.noteType).toBe("highlight");
    });

    it("should handle invalid note type", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Note",
          content: "Test Content",
          noteType: "invalid",
        });

      expect(response.status).toBe(400);
    });

    it("should filter notes by note type", async () => {
      // Create notes with different types
      await Note.bulkCreate([
        {
          userId: testUser.id,
          title: "Traditional Note",
          content: "Content 1",
          noteType: "traditional",
          createdAt: new Date("2025-01-01"),
          updatedAt: new Date(),
        },
        {
          userId: testUser.id,
          highlightedText: "Highlighted Text",
          explanation: "Explanation",
          noteType: "highlight",
          createdAt: new Date("2025-01-02"),
          updatedAt: new Date(),
        },
      ]);

      const response = await request(app)
        .get("/api/notes?noteType=traditional")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(
        response.body.notes.every((note) => note.noteType === "traditional")
      ).toBe(true);
    });

    it("should sort notes by different fields", async () => {
      const response = await request(app)
        .get("/api/notes?sortBy=title&sortOrder=asc")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
    });

    it("should handle database errors during creation", async () => {
      const originalCreate = Note.create;
      Note.create = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "Test Note",
          content: "Test Content",
        });

      expect(response.status).toBe(500);
      Note.create = originalCreate;
    });

    it("should handle validation errors", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${authToken}`)
        .send({
          title: "",
          content: "",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("required");
    });
  });
});
