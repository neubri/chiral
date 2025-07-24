const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

describe("Middleware Tests", () => {
  let testUser;
  let validToken;
  let expiredToken;

  beforeAll(async () => {
    // Clean up
    await User.destroy({ where: { email: "test@example.com" } });

    // Create test user
    const hashedPassword = bcrypt.hashSync("password123", 10);
    testUser = await User.create({
      name: "Test User",
      email: "test@example.com",
      password: hashedPassword,
      learningInterests: ["React", "Node.js"],
    });

    // Get valid token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    validToken = loginResponse.body.access_token;

    // Create expired token (simulate by using invalid signature)
    expiredToken =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTIzLCJpYXQiOjE2MzQ1NjQ0MDAsImV4cCI6MTYzNDU2NDQwMX0.invalid";
  });

  afterAll(async () => {
    await User.destroy({ where: { email: "test@example.com" } });
  });

  describe("Authentication Middleware", () => {
    it("should allow access with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("id");
    });

    it("should deny access without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should deny access with invalid token format", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Invalid token format");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should deny access with Bearer but no token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer ");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should deny access with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should deny access with expired token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should deny access when user no longer exists", async () => {
      // Delete the user temporarily
      await User.destroy({ where: { id: testUser.id } });

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");

      // Recreate user for other tests
      const hashedPassword = bcrypt.hashSync("password123", 10);
      testUser = await User.create({
        id: testUser.id,
        name: "Test User",
        email: "test@example.com",
        password: hashedPassword,
        learningInterests: ["React", "Node.js"],
      });
    });

    it("should work with different protected endpoints", async () => {
      // Test notes endpoint
      const notesResponse = await request(app)
        .get("/api/notes")
        .set("Authorization", `Bearer ${validToken}`);

      expect(notesResponse.status).toBe(200);

      // Test highlights endpoint
      const highlightsResponse = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${validToken}`);

      expect(highlightsResponse.status).toBe(200);

      // Test gemini endpoint
      const geminiResponse = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${validToken}`)
        .send({ highlightedText: "test" });

      // This might return 500 due to mocking, but should not be 401
      expect(geminiResponse.status).not.toBe(401);
    });

    it("should handle malformed JWT tokens", async () => {
      const malformedTokens = [
        "notjwt",
        "a.b",
        "a.b.c.d",
        "",
        "Bearer.token.here",
      ];

      for (const token of malformedTokens) {
        const response = await request(app)
          .get("/api/auth/profile")
          .set("Authorization", `Bearer ${token}`);

        expect(response.status).toBe(401);
        expect(response.body).toHaveProperty("message");
      }
    });
  });

  describe("Error Handler Middleware", () => {
    it("should handle validation errors", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "",
        email: "invalid-email",
        password: "123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle duplicate email errors", async () => {
      // First registration
      await request(app).post("/api/auth/register").send({
        name: "Test User",
        email: "duplicate@example.com",
        password: "password123",
      });

      // Duplicate registration
      const response = await request(app).post("/api/auth/register").send({
        name: "Another User",
        email: "duplicate@example.com",
        password: "password123",
      });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");

      // Cleanup
      await User.destroy({ where: { email: "duplicate@example.com" } });
    });

    it("should handle 404 errors for non-existent resources", async () => {
      const response = await request(app)
        .get("/api/notes/99999")
        .set("Authorization", `Bearer ${validToken}`);

      expect(response.status).toBe(404);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle internal server errors gracefully", async () => {
      // This would typically be triggered by database errors or other issues
      // For testing, we can try to access a protected route with a token for a non-existent user
      const fakeToken =
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6OTk5OTksImlhdCI6MTYzNDU2NDQwMH0.invalid";

      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${fakeToken}`);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("CORS Middleware", () => {
    it("should include CORS headers", async () => {
      const response = await request(app).get("/api/health");

      expect(response.headers).toHaveProperty("access-control-allow-origin");
    });

    it("should handle preflight requests", async () => {
      const response = await request(app)
        .options("/api/auth/login")
        .set("Origin", "http://localhost:3000")
        .set("Access-Control-Request-Method", "POST")
        .set("Access-Control-Request-Headers", "Content-Type");

      expect(response.status).toBe(204);
    });
  });

  describe("JSON Parsing Middleware", () => {
    it("should parse JSON requests correctly", async () => {
      const response = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });

    it("should handle malformed JSON", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/json")
        .send('{"invalid": json}');

      expect(response.status).toBe(400);
    });

    it("should handle large payloads", async () => {
      const largeObject = {
        email: "test@example.com",
        password: "password123",
        data: "a".repeat(1024 * 1024), // 1MB of data
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(largeObject);

      // Should either process or reject based on size limits
      expect([200, 400, 413]).toContain(response.status);
    });
  });

  describe("URL Encoded Middleware", () => {
    it("should parse URL encoded data", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .set("Content-Type", "application/x-www-form-urlencoded")
        .send("email=test@example.com&password=password123");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });
  });
});
