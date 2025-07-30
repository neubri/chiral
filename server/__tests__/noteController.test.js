const request = require("supertest");
const app = require("../app");
const { User, Note } = require("../models");

describe("Note Controller", () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Clean up existing test data first
    await User.destroy({ where: { email: 'noteuser@example.com' } });

    // Register a user for testing
    const userRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Test User",
        email: "noteuser@example.com",
        password: "password123",
      });

    if (userRes.statusCode === 409) {
      // User exists, login instead
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "noteuser@example.com",
          password: "password123",
        });
      token = loginRes.body.access_token;
      const user = await User.findOne({ where: { email: "noteuser@example.com" } });
      userId = user.id;
    } else {
      token = userRes.body.access_token;
      userId = userRes.body.user.id;
    }
  });

  afterAll(async () => {
    // Clean up test data
    await Note.destroy({ where: { userId } });
    await User.destroy({ where: { email: "noteuser@example.com" } });
  });

  describe("POST /api/notes", () => {
    it("should create a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Test Note",
          content: "This is a test note",
        });
      expect(response.status).toBe(201);
      expect(response.body.note).toHaveProperty("title", "Test Note");
      expect(response.body.note).toHaveProperty("content", "This is a test note");
      expect(response.body.note).toHaveProperty("userId", userId);
    });

    it("should create a note with all optional fields", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Complete Note",
          content: "This is a complete note",
          highlightedText: "Important text",
          explanation: "This is an explanation",
          originalContext: "Original context",
          isFavorite: true,
          noteType: "highlight"
        });
      expect(response.status).toBe(201);
      expect(response.body.note).toHaveProperty("title", "Complete Note");
      expect(response.body.note).toHaveProperty("highlightedText", "Important text");
      expect(response.body.note).toHaveProperty("isFavorite", true);
      expect(response.body.note).toHaveProperty("noteType", "highlight");
    });

    it("should create a note with highlight type without title requirement", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Highlighted content",
          explanation: "Explanation for highlight",
          noteType: "highlight"
        });
      expect(response.status).toBe(201);
      expect(response.body.note).toHaveProperty("highlightedText", "Highlighted content");
      expect(response.body.note).toHaveProperty("noteType", "highlight");
    });
  });

  describe("GET /api/notes", () => {
    it("should get all notes", async () => {
      const response = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("notes");
      expect(Array.isArray(response.body.notes)).toBe(true);
      expect(response.body).toHaveProperty("total");
    });

    it("should get notes with pagination", async () => {
      const response = await request(app)
        .get("/api/notes?page=1&limit=5")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("notes");
      expect(response.body.notes.length).toBeLessThanOrEqual(5);
    });

    it("should get notes with search filter", async () => {
      const response = await request(app)
        .get("/api/notes?search=test")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("notes");
      expect(Array.isArray(response.body.notes)).toBe(true);
    });

    it("should get notes filtered by type", async () => {
      const response = await request(app)
        .get("/api/notes?type=traditional")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("notes");
      expect(Array.isArray(response.body.notes)).toBe(true);
    });

    it("should get only favorite notes", async () => {
      const response = await request(app)
        .get("/api/notes?favorites=true")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("notes");
      expect(Array.isArray(response.body.notes)).toBe(true);
    });
  });

  describe("GET /api/notes/:id", () => {
    let testNoteId;

    beforeEach(async () => {
      const note = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Get Note Test",
          content: "Content for get test",
        });
      testNoteId = note.body.note.id;
    });

    it("should get a note by id", async () => {
      const response = await request(app)
        .get(`/api/notes/${testNoteId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body.note).toHaveProperty("id", testNoteId);
      expect(response.body.note).toHaveProperty("title", "Get Note Test");
    });

    it("should return 404 for non-existent note", async () => {
      const response = await request(app)
        .get("/api/notes/999999")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });
  });

  describe("PUT /api/notes/:id", () => {
    let updateNoteId;

    beforeEach(async () => {
      const note = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Update Note Test",
          content: "Content for update test",
        });
      updateNoteId = note.body.note.id;
    });

    it("should update a note", async () => {
      const response = await request(app)
        .put(`/api/notes/${updateNoteId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Updated Note Title",
          content: "Updated content",
          isFavorite: true
        });
      expect(response.status).toBe(200);
      expect(response.body.note).toHaveProperty("title", "Updated Note Title");
      expect(response.body.note).toHaveProperty("content", "Updated content");
      expect(response.body.note).toHaveProperty("isFavorite", true);
    });

    it("should return 404 for non-existent note update", async () => {
      const response = await request(app)
        .put("/api/notes/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Should not work",
          content: "Should not work"
        });
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });
  });

  describe("DELETE /api/notes/:id", () => {
    it("should delete a note", async () => {
      const note = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({
          title: "Delete Note Test",
          content: "Content for delete test",
        });

      const response = await request(app)
        .delete(`/api/notes/${note.body.note.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Note deleted successfully");
    });

    it("should return 404 for non-existent note deletion", async () => {
      const response = await request(app)
        .delete("/api/notes/999999")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });
  });

  describe("Note Controller Edge Cases", () => {
    let edgeUserId;
    let edgeToken;

    beforeAll(async () => {
      // Clean up any existing edge test user
      await User.destroy({ where: { email: 'noteedge@example.com' } });

      // Create edge test user
      const userRes = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Note Edge User",
          email: "noteedge@example.com",
          password: "password123",
        });

      if (userRes.statusCode === 409) {
        const loginRes = await request(app)
          .post("/api/auth/login")
          .send({
            email: "noteedge@example.com",
            password: "password123",
          });
        edgeToken = loginRes.body.access_token;
        const user = await User.findOne({ where: { email: "noteedge@example.com" } });
        edgeUserId = user.id;
      } else {
        edgeToken = userRes.body.access_token;
        edgeUserId = userRes.body.user.id;
      }
    });

    afterAll(async () => {
      await Note.destroy({ where: { userId: edgeUserId } });
      await User.destroy({ where: { email: "noteedge@example.com" } });
    });

    it("should return 401 if no token is provided for creating a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .send({
          title: "Should fail",
          content: "No token provided",
        });
      expect(response.status).toBe(401);
    });

    it("should return 400 if title is missing when creating a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${edgeToken}`)
        .send({
          content: "Missing title",
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Title is required for traditional notes");
    });

    it("should return 400 if content is missing when creating a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${edgeToken}`)
        .send({
          title: "Missing content",
        });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Content is required for traditional notes");
    });

    it("should return 404 for getting a note with invalid id", async () => {
      const response = await request(app)
        .get("/api/notes/999999")
        .set("Authorization", `Bearer ${edgeToken}`);
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Note not found");
    });

    it("should return 401 for getting notes with no token", async () => {
      const response = await request(app)
        .get("/api/notes");
      expect(response.status).toBe(401);
    });

    it("should return 401 for updating notes with no token", async () => {
      const response = await request(app)
        .put("/api/notes/1")
        .send({
          title: "Should fail",
          content: "No token"
        });
      expect(response.status).toBe(401);
    });

    it("should return 401 for deleting notes with no token", async () => {
      const response = await request(app)
        .delete("/api/notes/1");
      expect(response.status).toBe(401);
    });
  });
});
