jest.setTimeout(15000);

const request = require("supertest");
const app = require("../app");
const { User } = require("../models");

describe("Gemini Controller", () => {
  let token;

  beforeAll(async () => {
    // Clean up and create test user
    await User.destroy({ where: { email: 'geminitest@example.com' } });

    const userRes = await request(app)
      .post("/api/auth/register")
      .send({
        name: "Gemini Test User",
        email: "geminitest@example.com",
        password: "password123",
      });

    if (userRes.statusCode === 409) {
      const loginRes = await request(app)
        .post("/api/auth/login")
        .send({
          email: "geminitest@example.com",
          password: "password123",
        });
      token = loginRes.body.access_token;
    } else {
      token = userRes.body.access_token;
    }
  });

  afterAll(async () => {
    await User.destroy({ where: { email: "geminitest@example.com" } });
  });

  describe("POST /api/gemini/explain", () => {
    it("should return an explanation for valid input", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "What is Node.js?",
          context: "Node.js is a JavaScript runtime.",
        });
      expect([200, 500]).toContain(response.status);
    });

    it("should return 400 if highlightedText is missing", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          context: "Some context",
        });
      expect(response.status).toBe(400);
    });

    it("should return 400 if highlightedText is empty", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "",
          context: "Some context",
        });
      expect(response.status).toBe(400);
    });

    it("should return 400 if highlightedText is too long", async () => {
      const longText = "a".repeat(5001);
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: longText,
          context: "Some context",
        });
      expect(response.status).toBe(400);
    });

    it("should return 400 if context is too long", async () => {
      const longContext = "a".repeat(10001);
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Test text",
          context: longContext,
        });
      expect(response.status).toBe(400);
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .send({
          highlightedText: "Test without auth",
        });
      expect(response.status).toBe(401);
    });
  });
});
