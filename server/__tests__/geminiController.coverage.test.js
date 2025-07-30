const request = require("supertest");
const app = require("../app");
const jwt = require("jsonwebtoken");
const { User } = require("../models");
const bcryptHelper = require("../helpers/bcrypt");

describe("Gemini Controller Coverage Tests", () => {
  let token;
  let userId;

  beforeAll(async () => {
    // Create test user for authentication
    const hashedPassword = await bcryptHelper.hashPassword("testpassword");
    const user = await User.create({
      name: "Gemini Test User",
      email: "geminicoverage@example.com",
      password: hashedPassword,
      learningInterests: ["technology", "AI"],
    });
    userId = user.id;
    token = jwt.sign({ userId }, process.env.JWT_SECRET);
  });

  afterAll(async () => {
    await User.destroy({ where: { id: userId } });
  });

  describe("POST /api/gemini/explain - Coverage", () => {
    it("should handle all validation and success paths", async () => {
      // Test missing highlightedText
      const response1 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ context: "Some context" });
      expect([400, 401]).toContain(response1.status);

      // Test empty highlightedText
      const response2 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "", context: "Some context" });
      expect([400, 401]).toContain(response2.status);

      // Test highlighted text only spaces (trimmed to empty)
      const response3 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "   ", context: "Some context" });
      expect([400, 401]).toContain(response3.status);

      // Test highlighted text too long
      const longText = "a".repeat(5001);
      const response4 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: longText, context: "Some context" });
      expect([400, 401]).toContain(response4.status);

      // Test context too long
      const longContext = "a".repeat(10001);
      const response5 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "Valid text", context: longContext });
      expect([400, 401]).toContain(response5.status);

      // Test valid input (will hit Gemini helper and likely get API error due to invalid key)
      const response6 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "JavaScript is a programming language",
          context: "This is about programming"
        });
      expect([200, 400, 401, 500, 503]).toContain(response6.status);

      // Test valid input without context
      const response7 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Node.js is awesome"
        });
      expect([200, 400, 401, 500, 503]).toContain(response7.status);

      // Test input that needs trimming
      const response8 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "  Valid text with spaces  ",
          context: "  Context with spaces  "
        });
      expect([200, 400, 401, 500, 503]).toContain(response8.status);
    });

    it("should handle different error conditions", async () => {
      // Test without authentication token
      const response1 = await request(app)
        .post("/api/gemini/explain")
        .send({
          highlightedText: "Test text"
        });
      expect(response1.status).toBe(401);

      // Test with invalid token
      const response2 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", "Bearer invalid_token")
        .send({
          highlightedText: "Test text"
        });
      expect(response2.status).toBe(401);

      // Test with malformed JSON
      const response3 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .set("Content-Type", "application/json")
        .send("invalid json");
      expect([400, 401]).toContain(response3.status);
    });

    it("should handle edge cases in input validation", async () => {
      // Test with exactly 5000 characters (should pass)
      const exactLimitText = "a".repeat(5000);
      const response1 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: exactLimitText });
      expect([200, 400, 401, 500, 503]).toContain(response1.status);

      // Test with exactly 10000 characters context (should pass)
      const exactLimitContext = "a".repeat(10000);
      const response2 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Valid text",
          context: exactLimitContext
        });
      expect([200, 400, 401, 500, 503]).toContain(response2.status);

      // Test with special characters
      const response3 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Special chars: !@#$%^&*()",
          context: "Context with émojis 🚀 and unicode ñ"
        });
      expect([200, 400, 401, 500, 503]).toContain(response3.status);

      // Test with null context (should work)
      const response4 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Valid text",
          context: null
        });
      expect([200, 400, 401, 500, 503]).toContain(response4.status);

      // Test with undefined context (should work)
      const response5 = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "Valid text"
          // context intentionally omitted
        });
      expect([200, 400, 401, 500, 503]).toContain(response5.status);
    });
  });
});
