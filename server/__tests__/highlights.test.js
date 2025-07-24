const request = require("supertest");
const app = require("../app");
const { User, Highlight } = require("../models");
const TestHelpers = require("./utils/testHelpers");

// Mock the gemini helper
jest.mock("../helpers/gemini", () => ({
  explainText: jest
    .fn()
    .mockResolvedValue("Mocked AI explanation for testing purposes"),
}));

describe("Highlights Management", () => {
  let testUser;
  let authToken;
  let testHighlight;

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
    // Clean up highlights before each test
    await Highlight.destroy({ where: {} });
  });

  describe("POST /api/highlights", () => {
    it("should create a new highlight successfully with auto-explanation", async () => {
      const highlightData = {
        articleId: "12345",
        articleTitle: "Test Article",
        articleUrl: "https://example.com/article",
        highlightedText: "This is highlighted text",
        context: "surrounding context",
        position: { start: 100, end: 200 },
        tags: ["important", "react"],
        autoExplain: true,
      };

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${authToken}`)
        .send(highlightData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "Highlight created successfully"
      );
      expect(response.body.highlight).toHaveProperty("id");
      expect(response.body.highlight).toHaveProperty(
        "articleId",
        highlightData.articleId
      );
      expect(response.body.highlight).toHaveProperty(
        "highlightedText",
        highlightData.highlightedText
      );
      expect(response.body.highlight).toHaveProperty(
        "explanation",
        "Mocked AI explanation for testing purposes"
      );
      expect(response.body.highlight).toHaveProperty("userId", testUser.id);

      testHighlight = response.body.highlight;
    });

    it("should create a highlight without auto-explanation", async () => {
      const highlightData = {
        articleId: "12345",
        highlightedText: "This is highlighted text",
        autoExplain: false,
      };

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${authToken}`)
        .send(highlightData);

      expect(response.status).toBe(201);
      expect(response.body.highlight).toHaveProperty("explanation", null);
    });

    it("should return error without authentication", async () => {
      const highlightData = {
        articleId: "12345",
        highlightedText: "This is highlighted text",
      };

      const response = await request(app)
        .post("/api/highlights")
        .send(highlightData);

      expect(response.status).toBe(401);
    });

    it("should return error with missing required fields", async () => {
      const highlightData = {
        articleId: "12345",
        // missing highlightedText
      };

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${authToken}`)
        .send(highlightData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Highlighted text is required"
      );
    });

    it("should return error with missing articleId", async () => {
      const highlightData = {
        highlightedText: "This is highlighted text",
        // missing articleId
      };

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${authToken}`)
        .send(highlightData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message", "Article ID is required");
    });

    it("should return error with text too long", async () => {
      const highlightData = {
        articleId: "12345",
        highlightedText: "a".repeat(5001), // Over 5000 characters
      };

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${authToken}`)
        .send(highlightData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty(
        "message",
        "Highlighted text is too long (max 5000 characters)"
      );
    });
  });

  describe("GET /api/highlights", () => {
    beforeEach(async () => {
      // Create test highlights
      await Highlight.bulkCreate([
        {
          userId: testUser.id,
          articleId: "123",
          articleTitle: "Article 1",
          highlightedText: "Text 1",
          explanation: "Explanation 1",
          isBookmarked: true,
          createdAt: new Date("2025-01-01"),
        },
        {
          userId: testUser.id,
          articleId: "456",
          articleTitle: "Article 2",
          highlightedText: "Text 2",
          explanation: "Explanation 2",
          isBookmarked: false,
          createdAt: new Date("2025-01-02"),
        },
        {
          userId: testUser.id,
          articleId: "123",
          articleTitle: "Article 1",
          highlightedText: "Text 3",
          explanation: "Explanation 3",
          isBookmarked: true,
          createdAt: new Date("2025-01-03"),
        },
      ]);
    });

    it("should get all user highlights", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("highlights");
      expect(response.body.highlights).toHaveLength(3);
      expect(response.body).toHaveProperty("total", 3);
      expect(response.body).toHaveProperty("currentPage", 1);
      expect(response.body).toHaveProperty("totalPages", 1);
    });

    it("should support pagination", async () => {
      const response = await request(app)
        .get("/api/highlights?page=1&limit=2")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toHaveLength(2);
      expect(response.body).toHaveProperty("total", 3);
      expect(response.body).toHaveProperty("currentPage", 1);
      expect(response.body).toHaveProperty("totalPages", 2);
    });

    it("should filter by articleId", async () => {
      const response = await request(app)
        .get("/api/highlights?articleId=123")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toHaveLength(2);
      expect(response.body.highlights.every((h) => h.articleId === "123")).toBe(
        true
      );
    });

    it("should filter by bookmarked status", async () => {
      const response = await request(app)
        .get("/api/highlights?isBookmarked=true")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toHaveLength(2);
      expect(response.body.highlights.every((h) => h.isBookmarked)).toBe(true);
    });

    it("should support search functionality", async () => {
      const response = await request(app)
        .get("/api/highlights?search=Text 1")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toHaveLength(1);
      expect(response.body.highlights[0]).toHaveProperty(
        "highlightedText",
        "Text 1"
      );
    });

    it("should support sorting", async () => {
      const response = await request(app)
        .get("/api/highlights?sortBy=oldest")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toHaveLength(3);
      expect(response.body.highlights[0]).toHaveProperty(
        "highlightedText",
        "Text 1"
      );
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/highlights");

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/highlights/:id", () => {
    beforeEach(async () => {
      testHighlight = await Highlight.create({
        userId: testUser.id,
        articleId: "123",
        articleTitle: "Test Article",
        highlightedText: "Test Text",
        explanation: "Test Explanation",
      });
    });

    it("should get highlight by ID", async () => {
      const response = await request(app)
        .get(`/api/highlights/${testHighlight.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlight).toHaveProperty("id", testHighlight.id);
      expect(response.body.highlight).toHaveProperty(
        "highlightedText",
        "Test Text"
      );
    });

    it("should return error for non-existent highlight", async () => {
      const response = await request(app)
        .get("/api/highlights/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Highlight not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get(
        `/api/highlights/${testHighlight.id}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("PUT /api/highlights/:id", () => {
    beforeEach(async () => {
      testHighlight = await Highlight.create({
        userId: testUser.id,
        articleId: "123",
        articleTitle: "Test Article",
        highlightedText: "Test Text",
        explanation: "Test Explanation",
        isBookmarked: false,
      });
    });

    it("should update highlight successfully", async () => {
      const updateData = {
        highlightedText: "Updated Text",
        explanation: "Updated Explanation",
        isBookmarked: true,
        tags: ["updated", "important"],
      };

      const response = await request(app)
        .put(`/api/highlights/${testHighlight.id}`)
        .set("Authorization", `Bearer ${authToken}`)
        .send(updateData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Highlight updated successfully"
      );
      expect(response.body.highlight).toHaveProperty(
        "highlightedText",
        updateData.highlightedText
      );
      expect(response.body.highlight).toHaveProperty(
        "isBookmarked",
        updateData.isBookmarked
      );
    });

    it("should return error for non-existent highlight", async () => {
      const response = await request(app)
        .put("/api/highlights/99999")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ highlightedText: "Updated" });

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Highlight not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app)
        .put(`/api/highlights/${testHighlight.id}`)
        .send({ highlightedText: "Updated" });

      expect(response.status).toBe(401);
    });
  });

  describe("DELETE /api/highlights/:id", () => {
    beforeEach(async () => {
      testHighlight = await Highlight.create({
        userId: testUser.id,
        articleId: "123",
        highlightedText: "Test Text",
      });
    });

    it("should delete highlight successfully", async () => {
      const response = await request(app)
        .delete(`/api/highlights/${testHighlight.id}`)
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Highlight deleted successfully"
      );

      // Verify highlight is deleted
      const deletedHighlight = await Highlight.findByPk(testHighlight.id);
      expect(deletedHighlight).toBeNull();
    });

    it("should return error for non-existent highlight", async () => {
      const response = await request(app)
        .delete("/api/highlights/99999")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Highlight not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).delete(
        `/api/highlights/${testHighlight.id}`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("POST /api/highlights/:id/explain", () => {
    beforeEach(async () => {
      testHighlight = await Highlight.create({
        userId: testUser.id,
        articleId: "123",
        highlightedText: "Test Text",
      });
    });

    it("should generate explanation for highlight", async () => {
      const response = await request(app)
        .post(`/api/highlights/${testHighlight.id}/explain`)
        .set("Authorization", `Bearer ${authToken}`)
        .send({ context: "additional context" });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Explanation generated successfully"
      );
      expect(response.body).toHaveProperty(
        "explanation",
        "Mocked AI explanation for testing purposes"
      );
    });

    it("should return error for non-existent highlight", async () => {
      const response = await request(app)
        .post("/api/highlights/99999/explain")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Highlight not found");
    });

    it("should return error without authentication", async () => {
      const response = await request(app).post(
        `/api/highlights/${testHighlight.id}/explain`
      );

      expect(response.status).toBe(401);
    });
  });

  describe("GET /api/articles/:articleId/highlights", () => {
    beforeEach(async () => {
      // Create highlights for different articles
      await Highlight.bulkCreate([
        {
          userId: testUser.id,
          articleId: "123",
          highlightedText: "Text from article 123 - 1",
        },
        {
          userId: testUser.id,
          articleId: "123",
          highlightedText: "Text from article 123 - 2",
        },
        {
          userId: testUser.id,
          articleId: "456",
          highlightedText: "Text from article 456",
        },
      ]);
    });

    it("should get highlights for specific article", async () => {
      const response = await request(app)
        .get("/api/articles/123/highlights")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("highlights");
      expect(response.body.highlights).toHaveLength(2);
      expect(response.body.highlights.every((h) => h.articleId === "123")).toBe(
        true
      );
      expect(response.body).toHaveProperty("total", 2);
    });

    it("should return empty array for article with no highlights", async () => {
      const response = await request(app)
        .get("/api/articles/999/highlights")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toHaveLength(0);
      expect(response.body).toHaveProperty("total", 0);
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/articles/123/highlights");

      expect(response.status).toBe(401);
    });
  });
});
