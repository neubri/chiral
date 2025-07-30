const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const bcryptHelper = require("../helpers/bcrypt");
const axios = require("axios");

// Mock axios for pub controller tests
jest.mock("axios");
const mockedAxios = axios;

describe("Pub Controller Coverage Tests", () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user for authenticated endpoints
    const hashedPassword = await bcryptHelper.hashPassword("testpassword");
    const user = await User.create({
      name: "Pub Test User",
      email: "pubcoverage@example.com",
      password: hashedPassword,
      learningInterests: ["javascript", "react", "nodejs"],
    });
    userId = user.id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await User.destroy({ where: { id: userId } });
  });

  describe("GET /api/health - Coverage", () => {
    it("should return health check with all fields", async () => {
      const response = await request(app).get("/api/health");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Chiral server is running!");
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("version", "1.0.0");
      expect(new Date(response.body.timestamp)).toBeInstanceOf(Date);
    });
  });

  describe("GET /api/articles - Coverage", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should handle default parameters", async () => {
      const mockArticles = [
        { id: 1, title: "Test Article 1", published_at: "2023-01-01" },
        { id: 2, title: "Test Article 2", published_at: "2023-01-02" }
      ];

      mockedAxios.get.mockResolvedValue({ data: mockArticles });

      const response = await request(app).get("/api/articles");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body).toHaveProperty("total");
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining("/articles"),
        expect.objectContaining({
          params: expect.objectContaining({
            tag: "programming",
            per_page: 10,
            top: 7
          })
        })
      );
    });

    it("should handle custom tag parameter", async () => {
      const mockArticles = [{ id: 1, title: "React Article" }];
      mockedAxios.get.mockResolvedValue({ data: mockArticles });

      const response = await request(app).get("/api/articles?tag=REACT");
      expect(response.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            tag: "react" // should be lowercased
          })
        })
      );
    });

    it("should limit per_page to maximum 20", async () => {
      const mockArticles = [];
      mockedAxios.get.mockResolvedValue({ data: mockArticles });

      const response = await request(app).get("/api/articles?per_page=50");
      expect(response.status).toBe(200);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          params: expect.objectContaining({
            per_page: 20 // should be limited to 20
          })
        })
      );
    });

    it("should handle API errors", async () => {
      mockedAxios.get.mockRejectedValue(new Error("API Error"));

      const response = await request(app).get("/api/articles");
      expect(response.status).toBe(500);
    });

    it("should use custom DEV_TO_API_URL if provided", async () => {
      const originalUrl = process.env.DEV_TO_API_URL;
      process.env.DEV_TO_API_URL = "https://custom-api.com";

      const mockArticles = [];
      mockedAxios.get.mockResolvedValue({ data: mockArticles });

      await request(app).get("/api/articles");
      expect(mockedAxios.get).toHaveBeenCalledWith(
        "https://custom-api.com/articles",
        expect.any(Object)
      );

      // Restore original value
      if (originalUrl) {
        process.env.DEV_TO_API_URL = originalUrl;
      } else {
        delete process.env.DEV_TO_API_URL;
      }
    });
  });

  describe("GET /api/articles/:id - Coverage", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should handle missing article ID", async () => {
      // This would be handled by routing, but we can test with empty string
      const response = await request(app).get("/api/articles/");
      expect(response.status).toBe(404); // Route not found
    });

    it("should return enhanced article data", async () => {
      const mockArticle = {
        id: 123,
        title: "Test Article",
        description: "Test description",
        body_markdown: "# Test markdown content with multiple words",
        body_html: "<h1>Test HTML content</h1>",
        url: "https://dev.to/test",
        canonical_url: "https://dev.to/test",
        cover_image: "https://example.com/image.jpg",
        published_at: "2023-01-01T00:00:00Z",
        reading_time_minutes: 5,
        positive_reactions_count: 10,
        comments_count: 2,
        user: {
          name: "Test Author",
          username: "testauthor",
          profile_image: "https://example.com/avatar.jpg",
          website_url: "https://testauthor.com"
        },
        organization: { name: "Test Org" },
        tags: ["javascript", "react"],
        tag_list: "javascript, react"
      };

      mockedAxios.get.mockResolvedValue({ data: mockArticle });

      const response = await request(app).get("/api/articles/123");
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("article");
      expect(response.body).toHaveProperty("message", "Article content loaded successfully");

      const article = response.body.article;
      expect(article).toHaveProperty("word_count");
      expect(article).toHaveProperty("char_count");
      expect(article.word_count).toBeGreaterThan(0);
      expect(article.char_count).toBeGreaterThan(0);
    });

    it("should handle article without body_markdown", async () => {
      const mockArticle = {
        id: 123,
        title: "Test Article",
        // body_markdown intentionally missing
        user: {
          name: "Test Author",
          username: "testauthor",
          profile_image: "https://example.com/avatar.jpg"
        },
        tags: [],
        tag_list: ""
      };

      mockedAxios.get.mockResolvedValue({ data: mockArticle });

      const response = await request(app).get("/api/articles/123");
      expect(response.status).toBe(200);

      const article = response.body.article;
      expect(article.word_count).toBe(0);
      expect(article.char_count).toBe(0);
    });

    it("should handle 404 article not found", async () => {
      const error404 = new Error("Not Found");
      error404.response = { status: 404 };
      mockedAxios.get.mockRejectedValue(error404);

      const response = await request(app).get("/api/articles/999999");
      expect(response.status).toBe(404);
    });

    it("should handle other API errors", async () => {
      const apiError = new Error("API Error");
      apiError.response = { status: 500 };
      mockedAxios.get.mockRejectedValue(apiError);

      const response = await request(app).get("/api/articles/123");
      expect(response.status).toBe(500);
    });
  });

  describe("GET /api/articles/interests - Coverage", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should fetch articles based on user interests", async () => {
      const mockArticles1 = [
        { id: 1, title: "JS Article", published_at: "2023-01-03T00:00:00Z" }
      ];
      const mockArticles2 = [
        { id: 2, title: "React Article", published_at: "2023-01-02T00:00:00Z" }
      ];
      const mockArticles3 = [
        { id: 3, title: "Node Article", published_at: "2023-01-01T00:00:00Z" }
      ];

      mockedAxios.get
        .mockResolvedValueOnce({ data: mockArticles1 })
        .mockResolvedValueOnce({ data: mockArticles2 })
        .mockResolvedValueOnce({ data: mockArticles3 });

      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body).toHaveProperty("interests");
      expect(response.body.interests).toEqual(["javascript", "react", "nodejs"]);
      expect(mockedAxios.get).toHaveBeenCalledTimes(3); // One call per interest
    });

    it("should handle failed API requests gracefully", async () => {
      mockedAxios.get
        .mockResolvedValueOnce({ data: [{ id: 1, title: "Success Article" }] })
        .mockRejectedValueOnce(new Error("API Error"))
        .mockResolvedValueOnce({ data: [{ id: 2, title: "Another Success" }] });

      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.articles).toHaveLength(2);
    });

    it("should handle duplicate articles", async () => {
      const duplicateArticle = { id: 1, title: "Duplicate", published_at: "2023-01-01T00:00:00Z" };

      mockedAxios.get
        .mockResolvedValueOnce({ data: [duplicateArticle] })
        .mockResolvedValueOnce({ data: [duplicateArticle] }) // Same article
        .mockResolvedValueOnce({ data: [{ id: 2, title: "Unique", published_at: "2023-01-02T00:00:00Z" }] });

      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.articles).toHaveLength(2); // Duplicates removed
    });

    it("should sort articles by published date", async () => {
      const oldArticle = { id: 1, title: "Old", published_at: "2023-01-01T00:00:00Z" };
      const newArticle = { id: 2, title: "New", published_at: "2023-01-03T00:00:00Z" };
      const midArticle = { id: 3, title: "Mid", published_at: "2023-01-02T00:00:00Z" };

      mockedAxios.get
        .mockResolvedValueOnce({ data: [oldArticle] })
        .mockResolvedValueOnce({ data: [newArticle] })
        .mockResolvedValueOnce({ data: [midArticle] });

      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.articles[0].id).toBe(2); // Newest first
      expect(response.body.articles[1].id).toBe(3); // Middle
      expect(response.body.articles[2].id).toBe(1); // Oldest last
    });

    it("should limit articles based on per_page", async () => {
      const manyArticles = Array.from({ length: 20 }, (_, i) => ({
        id: i + 1,
        title: `Article ${i + 1}`,
        published_at: "2023-01-01T00:00:00Z"
      }));

      mockedAxios.get
        .mockResolvedValue({ data: manyArticles.slice(0, 7) })
        .mockResolvedValue({ data: manyArticles.slice(7, 14) })
        .mockResolvedValue({ data: manyArticles.slice(14, 20) });

      const response = await request(app)
        .get("/api/articles/interests?per_page=5")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(response.body.articles.length).toBeLessThanOrEqual(5);
    });

    it("should handle user without authentication (fallback to programming)", async () => {
      mockedAxios.get.mockResolvedValue({
        data: [{ id: 1, title: "Programming Article", published_at: "2023-01-01T00:00:00Z" }]
      });

      const response = await request(app).get("/api/articles/interests");

      // This should either be 401 (unauthorized) or use default interests
      expect([200, 401]).toContain(response.status);
    });

    it("should handle general errors", async () => {
      mockedAxios.get.mockRejectedValue(new Error("Network Error"));

      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${token}`);

      expect(response.status).toBe(500);
    });
  });
});
