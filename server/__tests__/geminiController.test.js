jest.setTimeout(15000);

const request = require("supertest");
const app = require("../app");

let token;
beforeAll(async () => {
  await request(app).post("/api/auth/register").send({
    name: "Gemini Test User",
    email: "geminitest@example.com",
    password: "testpassword",
  });
  const login = await request(app).post("/api/auth/login").send({
    email: "geminitest@example.com",
    password: "testpassword",
  });
  token = login.body.access_token;
});

describe("Gemini Controller", () => {
  describe("POST /api/gemini/explain", () => {
    it("should return an explanation for valid input", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({
          highlightedText: "What is Node.js?",
          context: "Node.js is a JavaScript runtime.",
        });
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "highlightedText",
        "What is Node.js?"
      );
      expect(response.body).toHaveProperty("explanation");
    }, 30000);

    it("should return 400 if highlightedText is missing", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ context: "Some context" });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if highlightedText is empty", async () => {
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "   " });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if highlightedText is too long", async () => {
      const longText = "a".repeat(5001);
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: longText });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if context is too long", async () => {
      const longContext = "a".repeat(10001);
      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "Test", context: longContext });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });
});
