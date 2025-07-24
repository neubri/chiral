const request = require("supertest");
const app = require("../app");
const setupTestDatabase = require("./setup");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

let authToken;
let testUser;

beforeAll(async () => {
  await setupTestDatabase();
});

afterAll(async () => {
  await setupTestDatabase.close();
});

beforeEach(async () => {
  // Clear existing user
  await User.destroy({ where: { email: "test@example.com" } });

  // Create test user
  testUser = await User.create({
    name: "Test User",
    email: "test@example.com",
    password: "hashedpassword123",
    learningInterests: ["programming", "javascript"],
  });

  authToken = signToken({ id: testUser.id });
});

describe("Public Articles", () => {
  describe("GET /api/public/articles", () => {
    it("should get articles without authentication", async () => {
      const response = await request(app).get("/api/public/articles");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(Array.isArray(response.body.articles)).toBe(true);
    });

    it("should get articles with pagination", async () => {
      const response = await request(app).get(
        "/api/public/articles?per_page=5"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body.articles.length).toBeLessThanOrEqual(5);
    });

    it("should get articles with tag filter", async () => {
      const response = await request(app).get(
        "/api/public/articles?tag=javascript"
      );

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
    });

    it("should handle API errors gracefully", async () => {
      // Mock axios to simulate API failure
      jest.mock("axios");
      const axios = require("axios");
      axios.get.mockRejectedValue(new Error("API Error"));

      const response = await request(app).get("/api/public/articles");

      // Should still return a response, possibly empty
      expect(response.status).toBe(200);
    });
  });

  describe("GET /api/public/articles/:id", () => {
    it("should get a specific article", async () => {
      // Use a known article ID from dev.to
      const response = await request(app).get("/api/public/articles/1000000");

      // This might return 404 if article doesn't exist, which is fine
      expect([200, 404]).toContain(response.status);
    });

    it("should handle non-existent article", async () => {
      const response = await request(app).get("/api/public/articles/999999999");

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/articles/interests", () => {
    it("should get articles by user interests with authentication", async () => {
      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body).toHaveProperty("interests");
      expect(response.body.interests).toEqual(["programming", "javascript"]);
    });

    it("should handle user without interests", async () => {
      // Update user to have no interests
      await testUser.update({ learningInterests: [] });

      const response = await request(app)
        .get("/api/articles/interests")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("articles");
      expect(response.body).toHaveProperty("interests");
    });

    it("should require authentication", async () => {
      const response = await request(app).get("/api/articles/interests");

      expect(response.status).toBe(401);
    });

    it("should handle per_page parameter", async () => {
      const response = await request(app)
        .get("/api/articles/interests?per_page=5")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.articles.length).toBeLessThanOrEqual(5);
    });
  });
});
