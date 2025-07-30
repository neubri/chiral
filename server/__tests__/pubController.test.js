const request = require("supertest");
const app = require("../app");

describe("Public Controller", () => {
  describe("GET /api/articles", () => {
    it("should return a list of public articles", async () => {
      const response = await request(app).get("/api/articles");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should handle search query parameter", async () => {
      const response = await request(app).get(
        "/api/articles?search=technology"
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should handle category filter", async () => {
      const response = await request(app).get("/api/articles?category=tech");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should handle pagination", async () => {
      const response = await request(app).get("/api/articles?page=1&limit=5");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should handle invalid page parameter", async () => {
      const response = await request(app).get("/api/articles?page=invalid");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
    });

    it("should handle empty results", async () => {
      const response = await request(app).get(
        "/api/articles?search=nonexistentarticle12345"
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });
  });

  describe("GET /api/articles/:id", () => {
    it("should return a single article if exists", async () => {
      const response = await request(app).get("/api/articles/1");
      // Could be 200 if article exists or 404 if not
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty("article");
      } else {
        expect(response.body).toHaveProperty("message");
      }
    });

    it("should return 404 for non-existent article", async () => {
      const response = await request(app).get("/api/articles/999999");
      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message", "Article not found");
    });

    it("should handle invalid article ID format", async () => {
      const response = await request(app).get("/api/articles/invalid-id");
      expect([400, 404]).toContain(response.status);
    });
  });

  describe("GET /api/health", () => {
    it("should return health check message", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Server is running!");
    });
  });

  describe("GET /api/articles/category/:category", () => {
    it("should return articles by category", async () => {
      const response = await request(app).get(
        "/api/articles/category/technology"
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should handle empty category", async () => {
      const response = await request(app).get("/api/articles/category/");
      expect([404, 400]).toContain(response.status);
    });

    it("should handle non-existent category", async () => {
      const response = await request(app).get(
        "/api/articles/category/nonexistentcategory123"
      );
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });
  });

  describe("GET /api/articles/trending", () => {
    it("should return trending articles", async () => {
      const response = await request(app).get("/api/articles/trending");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should limit trending articles", async () => {
      const response = await request(app).get("/api/articles/trending?limit=3");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });
  });

  describe("GET /api/articles/recent", () => {
    it("should return recent articles", async () => {
      const response = await request(app).get("/api/articles/recent");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should limit recent articles", async () => {
      const response = await request(app).get("/api/articles/recent?limit=5");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });
  });
});
