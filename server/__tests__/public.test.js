const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

// Mock axios for external API calls
jest.mock("axios");
const axios = require("axios");

describe("Public Endpoints", () => {
  let testUser;
  let authToken;

  beforeAll(async () => {
    // Clean up and create test user for authenticated endpoints
    await User.destroy({ where: { email: "test@example.com" } });

    const hashedPassword = bcrypt.hashSync("password123", 10);
    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      learningInterests: ["React", "Node.js"],
    });

    // Login to get token for authenticated tests
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    await User.destroy({ where: { email: "test@example.com" } });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/articles", () => {
    const mockArticlesResponse = {
      data: [
        {
          type_of: "article",
          id: 2636769,
          title: "Test Article 1",
          description: "Test description 1",
          readable_publish_date: "Jul 17",
          slug: "test-article-1",
          url: "https://dev.to/test-article-1",
          comments_count: 9,
          public_reactions_count: 140,
          reading_time_minutes: 14,
          tag_list: ["react", "javascript"],
          user: {
            name: "Test Author",
            username: "testauthor",
            profile_image: "https://example.com/profile.jpg",
            profile_image_90: "https://example.com/profile_90.jpg",
          },
        },
        {
          type_of: "article",
          id: 2636770,
          title: "Test Article 2",
          description: "Test description 2",
          readable_publish_date: "Jul 18",
          slug: "test-article-2",
          url: "https://dev.to/test-article-2",
          comments_count: 5,
          public_reactions_count: 80,
          reading_time_minutes: 8,
          tag_list: ["node", "javascript"],
          user: {
            name: "Another Author",
            username: "anotherauthor",
            profile_image: "https://example.com/profile2.jpg",
            profile_image_90: "https://example.com/profile2_90.jpg",
          },
        },
      ],
    };

    it("should get public articles successfully", async () => {
      axios.get.mockResolvedValue(mockArticlesResponse);

      const response = await request(app).get("/api/articles");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body.articles).toHaveLength(2);
      expect(response.body).toHaveProperty("total", 2);
      expect(response.body.articles[0]).toHaveProperty(
        "title",
        "Test Article 1"
      );
      expect(response.body.articles[1]).toHaveProperty(
        "title",
        "Test Article 2"
      );
    });

    it("should support tag filtering", async () => {
      const filteredResponse = {
        data: [mockArticlesResponse.data[0]], // Only react articles
      };
      axios.get.mockResolvedValue(filteredResponse);

      const response = await request(app).get("/api/articles?tag=react");

      expect(response.status).toBe(200);
      expect(response.body.articles).toHaveLength(1);
      expect(response.body.articles[0].tag_list).toContain("react");

      // Verify the API was called with the correct parameters
      expect(axios.get).toHaveBeenCalledWith(
        "https://dev.to/api/articles",
        expect.objectContaining({
          params: expect.objectContaining({
            tag: "react",
          }),
        })
      );
    });

    it("should support pagination", async () => {
      axios.get.mockResolvedValue(mockArticlesResponse);

      const response = await request(app).get(
        "/api/articles?page=2&per_page=10"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");

      // Verify the API was called with pagination parameters
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("page=2"));
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("per_page=10")
      );
    });

    it("should handle external API errors", async () => {
      axios.get.mockRejectedValue(new Error("External API error"));

      const response = await request(app).get("/api/articles");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });

    it("should return empty array when no articles found", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const response = await request(app).get("/api/articles");

      expect(response.status).toBe(200);
      expect(response.body.articles).toHaveLength(0);
      expect(response.body).toHaveProperty("total", 0);
    });

    it("should handle invalid pagination parameters", async () => {
      axios.get.mockResolvedValue(mockArticlesResponse);

      const response = await request(app).get(
        "/api/articles?page=-1&per_page=abc"
      );

      expect(response.status).toBe(200);
      // Should still work with default values
      expect(response.body).toHaveProperty("articles");
    });
  });

  describe("GET /api/articles/:id", () => {
    const mockArticleDetail = {
      data: {
        type_of: "article",
        id: 2636769,
        title: "Test Article Detail",
        description: "Detailed description",
        url: "https://dev.to/test-article-detail",
        cover_image: "https://example.com/cover.jpg",
        social_image: "https://example.com/social.jpg",
        body_markdown: "# Test Article\n\nThis is the content...",
        readable_publish_date: "Jul 17",
        reading_time_minutes: 14,
        tag_list: ["react", "javascript"],
        user: {
          name: "Test Author",
          username: "testauthor",
          profile_image: "https://example.com/profile.jpg",
          profile_image_90: "https://example.com/profile_90.jpg",
        },
      },
    };

    it("should get article detail successfully", async () => {
      axios.get.mockResolvedValue(mockArticleDetail);

      const response = await request(app).get("/api/articles/2636769");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("article");
      expect(response.body.article).toHaveProperty("id", 2636769);
      expect(response.body.article).toHaveProperty(
        "title",
        "Test Article Detail"
      );
      expect(response.body.article).toHaveProperty("body_markdown");
    });

    it("should return error for non-existent article", async () => {
      const notFoundError = new Error("Not found");
      notFoundError.response = { status: 404 };
      axios.get.mockRejectedValue(notFoundError);

      const response = await request(app).get("/api/articles/999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle external API errors", async () => {
      axios.get.mockRejectedValue(new Error("External API error"));

      const response = await request(app).get("/api/articles/2636769");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle invalid article ID", async () => {
      const response = await request(app).get("/api/articles/invalid-id");

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/my-articles", () => {
    it("should get articles by user interests with authentication", async () => {
      const interestBasedArticles = {
        data: [
          {
            type_of: "article",
            id: 2636769,
            title: "React Article",
            tag_list: ["react", "javascript"],
            user: {
              name: "React Author",
              username: "reactauthor",
            },
          },
          {
            type_of: "article",
            id: 2636770,
            title: "Node.js Article",
            tag_list: ["nodejs", "backend"],
            user: {
              name: "Node Author",
              username: "nodeauthor",
            },
          },
        ],
      };

      axios.get.mockResolvedValue(interestBasedArticles);

      const response = await request(app)
        .get("/api/my-articles")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body.articles).toHaveLength(2);
      expect(response.body).toHaveProperty("total", 2);

      // Should call external API with user's interests
      expect(axios.get).toHaveBeenCalled();
    });

    it("should return error without authentication", async () => {
      const response = await request(app).get("/api/my-articles");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should support pagination for user articles", async () => {
      axios.get.mockResolvedValue({ data: [] });

      const response = await request(app)
        .get("/api/my-articles?page=2&per_page=5")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");

      // Verify pagination parameters were passed
      expect(axios.get).toHaveBeenCalledWith(expect.stringContaining("page=2"));
      expect(axios.get).toHaveBeenCalledWith(
        expect.stringContaining("per_page=5")
      );
    });

    it("should handle user with no learning interests", async () => {
      // Update user to have no interests
      await testUser.update({ learningInterests: [] });

      axios.get.mockResolvedValue({ data: [] });

      const response = await request(app)
        .get("/api/my-articles")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.articles).toHaveLength(0);

      // Reset user interests
      await testUser.update({ learningInterests: ["React", "Node.js"] });
    });

    it("should handle external API errors for user articles", async () => {
      axios.get.mockRejectedValue(new Error("External API error"));

      const response = await request(app)
        .get("/api/my-articles")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("Error handling", () => {
    it("should handle network timeouts", async () => {
      const timeoutError = new Error("Network timeout");
      timeoutError.code = "ECONNABORTED";
      axios.get.mockRejectedValue(timeoutError);

      const response = await request(app).get("/api/articles");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle malformed response from external API", async () => {
      axios.get.mockResolvedValue({ invalid: "response" });

      const response = await request(app).get("/api/articles");

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle rate limiting from external API", async () => {
      const rateLimitError = new Error("Rate limit exceeded");
      rateLimitError.response = { status: 429 };
      axios.get.mockRejectedValue(rateLimitError);

      const response = await request(app).get("/api/articles");

      expect(response.status).toBe(429);
      expect(response.body).toHaveProperty("message");
    });
  });
});
