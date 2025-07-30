const request = require("supertest");
const app = require("../app");
const { User, Highlight } = require("../models");
const jwtHelper = require("../helpers/jwt");
const geminiHelper = require("../helpers/gemini");

// Mock external dependencies
jest.mock("../helpers/gemini");

describe("HighlightController Coverage Tests", () => {
  let user, token, highlight;

  beforeAll(async () => {
    // Create test user
    user = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: "hashedpassword",
      googleId: null,
    });

    token = jwtHelper.signToken({ id: user.id, email: user.email });

    // Create test highlight
    highlight = await Highlight.create({
      userId: user.id,
      articleId: "test-article-123",
      articleTitle: "Test Article",
      articleUrl: "https://example.com/article",
      highlightedText: "Sample highlighted text",
      explanation: "Sample explanation",
      context: "Sample context",
      position: { start: 0, end: 23 },
      tags: ["tag1", "tag2"],
      isBookmarked: false,
    });
  });

  afterAll(async () => {
    await Highlight.destroy({ where: {} });
    await User.destroy({ where: {} });
  });

  describe("POST /api/highlights - createHighlight coverage", () => {
    beforeEach(() => {
      geminiHelper.explainText.mockReset();
    });

    test("should handle missing articleId", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Test text",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Article ID is required");
    });

    test("should handle missing highlightedText", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "test-123",
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Highlighted text is required");
    });

    test("should handle text too long", async () => {
      const longText = "a".repeat(5001);

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "test-123",
          highlightedText: longText,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Highlighted text is too long");
    });

    test("should handle gemini explanation failure gracefully", async () => {
      geminiHelper.explainText.mockRejectedValue(new Error("Gemini API error"));

      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "test-123",
          highlightedText: "Test text",
          autoExplain: true,
        });

      expect(response.status).toBe(201);
      expect(response.body.highlight.explanation).toBeNull();
    });

    test("should create highlight without auto explanation", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "test-123",
          highlightedText: "Test text",
          autoExplain: false,
        });

      expect(response.status).toBe(201);
      expect(response.body.highlight.explanation).toBeNull();
    });

    test("should trim whitespace from inputs", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "test-123",
          highlightedText: "  Test text  ",
          context: "  Test context  ",
        });

      expect(response.status).toBe(201);
      expect(response.body.highlight.highlightedText).toBe("Test text");
    });

    test("should handle null context gracefully", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "test-123",
          highlightedText: "Test text",
          context: null,
        });

      expect(response.status).toBe(201);
      expect(response.body.highlight.context).toBeNull();
    });
  });

  describe("GET /api/highlights - getHighlights coverage", () => {
    test("should handle articleId filter", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .query({
          articleId: "test-article-123",
        });

      expect(response.status).toBe(200);
      expect(response.body.filters.articleId).toBe("test-article-123");
    });

    test("should handle isBookmarked filter true", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .query({
          isBookmarked: "true",
        });

      expect(response.status).toBe(200);
      expect(response.body.filters.isBookmarked).toBe("true");
    });

    test("should handle isBookmarked filter false", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .query({
          isBookmarked: "false",
        });

      expect(response.status).toBe(200);
      expect(response.body.filters.isBookmarked).toBe("false");
    });

    test("should handle search query", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .query({
          search: "sample",
        });

      expect(response.status).toBe(200);
      expect(response.body.filters.search).toBe("sample");
    });

    test("should handle oldest sorting", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .query({
          sortBy: "oldest",
        });

      expect(response.status).toBe(200);
    });

    test("should handle pagination", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .query({
          page: 2,
          limit: 5,
        });

      expect(response.status).toBe(200);
      expect(response.body.currentPage).toBe(2);
    });
  });

  describe("GET /api/highlights/:id - getHighlightById coverage", () => {
    test("should handle highlight not found", async () => {
      const response = await request(app)
        .get("/api/highlights/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Highlight not found");
    });

    test("should get highlight successfully", async () => {
      const response = await request(app)
        .get(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.highlight.id).toBe(highlight.id);
    });
  });

  describe("PUT /api/highlights/:id - updateHighlight coverage", () => {
    test("should handle highlight not found", async () => {
      const response = await request(app)
        .put("/api/highlights/999999")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Updated text",
        });

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Highlight not found");
    });

    test("should handle text too long in update", async () => {
      const longText = "a".repeat(5001);

      const response = await request(app)
        .put(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: longText,
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toContain("Highlighted text is too long");
    });

    test("should update highlightedText", async () => {
      const response = await request(app)
        .put(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "  Updated text  ",
        });

      expect(response.status).toBe(200);
      expect(response.body.highlight.highlightedText).toBe("Updated text");
    });

    test("should update explanation", async () => {
      const response = await request(app)
        .put(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          explanation: "Updated explanation",
        });

      expect(response.status).toBe(200);
      expect(response.body.highlight.explanation).toBe("Updated explanation");
    });

    test("should update tags", async () => {
      const response = await request(app)
        .put(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          tags: ["new-tag"],
        });

      expect(response.status).toBe(200);
      expect(response.body.highlight.tags).toEqual(["new-tag"]);
    });

    test("should update isBookmarked", async () => {
      const response = await request(app)
        .put(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          isBookmarked: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.highlight.isBookmarked).toBe(true);
    });

    test("should handle undefined fields gracefully", async () => {
      const response = await request(app)
        .put(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          someRandomField: "value",
        });

      expect(response.status).toBe(200);
    });
  });

  describe("DELETE /api/highlights/:id - deleteHighlight coverage", () => {
    test("should handle highlight not found", async () => {
      const response = await request(app)
        .delete("/api/highlights/999999")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Highlight not found");
    });

    test("should delete highlight successfully", async () => {
      // Create a highlight to delete
      const toDelete = await Highlight.create({
        userId: user.id,
        articleId: "delete-test",
        highlightedText: "To be deleted",
      });

      const response = await request(app)
        .delete(`/api/highlights/${toDelete.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.message).toContain("deleted successfully");
    });
  });

  describe("POST /api/highlights/:id/explain - explainHighlight coverage", () => {
    beforeEach(() => {
      geminiHelper.explainText.mockReset();
    });

    test("should handle highlight not found", async () => {
      const response = await request(app)
        .post("/api/highlights/999999/explain")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(404);
      expect(response.body.message).toContain("Highlight not found");
    });

    test("should return existing explanation when not regenerating", async () => {
      const response = await request(app)
        .post(`/api/highlights/${highlight.id}/explain`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.explanation).toBe("Updated explanation");
    });

    test("should regenerate explanation when requested", async () => {
      geminiHelper.explainText.mockResolvedValue("New explanation");

      const response = await request(app)
        .post(`/api/highlights/${highlight.id}/explain`)
        .set("Authorization", `Bearer ${token}`)
        .query({
          regenerate: true,
        });

      expect(response.status).toBe(200);
      expect(response.body.explanation).toBe("New explanation");
      expect(response.body.message).toContain("regenerated successfully");
    });

    test("should generate explanation for highlight without one", async () => {
      // Create highlight without explanation
      const noExplanation = await Highlight.create({
        userId: user.id,
        articleId: "no-explanation",
        highlightedText: "No explanation text",
        explanation: null,
      });

      geminiHelper.explainText.mockResolvedValue("Generated explanation");

      const response = await request(app)
        .post(`/api/highlights/${noExplanation.id}/explain`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.explanation).toBe("Generated explanation");
      expect(response.body.message).toContain("generated successfully");

      await noExplanation.destroy();
    });

    test("should handle gemini API error", async () => {
      // Create highlight without explanation
      const noExplanation = await Highlight.create({
        userId: user.id,
        articleId: "gemini-error",
        highlightedText: "Error text",
        explanation: null,
      });

      geminiHelper.explainText.mockRejectedValue(new Error("Gemini API error"));

      const response = await request(app)
        .post(`/api/highlights/${noExplanation.id}/explain`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);

      await noExplanation.destroy();
    });
  });

  describe("GET /api/highlights/article/:articleId - getArticleHighlights coverage", () => {
    test("should get highlights for specific article", async () => {
      const response = await request(app)
        .get(`/api/highlights/article/${highlight.articleId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.articleId).toBe(highlight.articleId);
      expect(response.body.highlights).toBeInstanceOf(Array);
      expect(response.body.total).toBeGreaterThanOrEqual(0);
    });

    test("should return empty array for non-existent article", async () => {
      const response = await request(app)
        .get("/api/highlights/article/non-existent")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.highlights).toEqual([]);
      expect(response.body.total).toBe(0);
    });
  });

  describe("cleanHighlightResponse helper coverage", () => {
    test("should clean highlight response properly", async () => {
      const response = await request(app)
        .get(`/api/highlights/${highlight.id}`)
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);

      const cleanedHighlight = response.body.highlight;
      expect(cleanedHighlight).toHaveProperty("id");
      expect(cleanedHighlight).toHaveProperty("userId");
      expect(cleanedHighlight).toHaveProperty("articleId");
      expect(cleanedHighlight).toHaveProperty("articleTitle");
      expect(cleanedHighlight).toHaveProperty("articleUrl");
      expect(cleanedHighlight).toHaveProperty("highlightedText");
      expect(cleanedHighlight).toHaveProperty("explanation");
      expect(cleanedHighlight).toHaveProperty("context");
      expect(cleanedHighlight).toHaveProperty("position");
      expect(cleanedHighlight).toHaveProperty("tags");
      expect(cleanedHighlight).toHaveProperty("isBookmarked");
      expect(cleanedHighlight).toHaveProperty("createdAt");
      expect(cleanedHighlight).toHaveProperty("updatedAt");
    });
  });
});
