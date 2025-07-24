const request = require("supertest");
const app = require("../app");
const { User } = require("../models");
const bcrypt = require("bcryptjs");

// Mock the gemini helper
jest.mock("../helpers/gemini", () => ({
  explainText: jest.fn(),
}));

const geminiHelper = require("../helpers/gemini");

describe("Gemini AI Explain", () => {
  let testUser;
  let authToken;

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

    // Login to get token
    const loginResponse = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });
    authToken = loginResponse.body.access_token;
  });

  afterAll(async () => {
    // Clean up
    await User.destroy({ where: { email: "test@example.com" } });
  });

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
  });

  describe("POST /api/gemini/explain", () => {
    it("should explain text successfully", async () => {
      const explainData = {
        highlightedText: "async/await",
        context: "JavaScript programming",
      };

      const mockExplanation =
        "Async/await is a JavaScript feature for handling asynchronous operations in a more readable way.";
      geminiHelper.explainText.mockResolvedValue(mockExplanation);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "highlightedText",
        explainData.highlightedText
      );
      expect(response.body).toHaveProperty("explanation", mockExplanation);
      expect(response.body).toHaveProperty("context", explainData.context);

      expect(geminiHelper.explainText).toHaveBeenCalledWith(
        explainData.highlightedText,
        explainData.context
      );
    });

    it("should explain text without context", async () => {
      const explainData = {
        highlightedText: "React hooks",
      };

      const mockExplanation =
        "React hooks are functions that let you use state and other React features in functional components.";
      geminiHelper.explainText.mockResolvedValue(mockExplanation);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "highlightedText",
        explainData.highlightedText
      );
      expect(response.body).toHaveProperty("explanation", mockExplanation);
      expect(response.body).toHaveProperty("context", null);

      expect(geminiHelper.explainText).toHaveBeenCalledWith(
        explainData.highlightedText,
        null
      );
    });

    it("should return error without authentication", async () => {
      const explainData = {
        highlightedText: "async/await",
      };

      const response = await request(app)
        .post("/api/gemini/explain")
        .send(explainData);

      expect(response.status).toBe(401);
      expect(geminiHelper.explainText).not.toHaveBeenCalled();
    });

    it("should return error with missing highlighted text", async () => {
      const explainData = {
        context: "JavaScript programming",
        // missing highlightedText
      };

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(geminiHelper.explainText).not.toHaveBeenCalled();
    });

    it("should return error with empty highlighted text", async () => {
      const explainData = {
        highlightedText: "",
        context: "JavaScript programming",
      };

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(geminiHelper.explainText).not.toHaveBeenCalled();
    });

    it("should return error with text too long", async () => {
      const explainData = {
        highlightedText: "a".repeat(5001), // Over 5000 characters
        context: "JavaScript programming",
      };

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
      expect(geminiHelper.explainText).not.toHaveBeenCalled();
    });

    it("should handle AI service errors gracefully", async () => {
      const explainData = {
        highlightedText: "async/await",
        context: "JavaScript programming",
      };

      const errorMessage = "AI service temporarily unavailable";
      geminiHelper.explainText.mockRejectedValue(new Error(errorMessage));

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");

      expect(geminiHelper.explainText).toHaveBeenCalledWith(
        explainData.highlightedText,
        explainData.context
      );
    });

    it("should sanitize input text", async () => {
      const explainData = {
        highlightedText: "  async/await  ",
        context: "  JavaScript programming  ",
      };

      const mockExplanation = "Async/await explanation";
      geminiHelper.explainText.mockResolvedValue(mockExplanation);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("highlightedText", "async/await");
      expect(response.body).toHaveProperty("context", "JavaScript programming");

      expect(geminiHelper.explainText).toHaveBeenCalledWith(
        "async/await",
        "JavaScript programming"
      );
    });

    it("should handle rate limiting", async () => {
      const explainData = {
        highlightedText: "async/await",
      };

      const rateLimitError = new Error("Rate limit exceeded");
      rateLimitError.name = "Rate Limit";
      geminiHelper.explainText.mockRejectedValue(rateLimitError);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });

    it("should handle network timeouts", async () => {
      const explainData = {
        highlightedText: "async/await",
      };

      const timeoutError = new Error("Request timeout");
      timeoutError.name = "Timeout";
      geminiHelper.explainText.mockRejectedValue(timeoutError);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty("message");
    });

    it("should work with special characters", async () => {
      const explainData = {
        highlightedText: "const [state, setState] = useState()",
        context: "React hooks",
      };

      const mockExplanation = "This is the useState hook syntax in React.";
      geminiHelper.explainText.mockResolvedValue(mockExplanation);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("explanation", mockExplanation);

      expect(geminiHelper.explainText).toHaveBeenCalledWith(
        explainData.highlightedText,
        explainData.context
      );
    });

    it("should work with code snippets", async () => {
      const explainData = {
        highlightedText: `function fetchData() {
  return fetch('/api/data')
    .then(response => response.json());
}`,
        context: "JavaScript API calls",
      };

      const mockExplanation =
        "This function makes an API call and returns a promise that resolves to JSON data.";
      geminiHelper.explainText.mockResolvedValue(mockExplanation);

      const response = await request(app)
        .post("/api/gemini/explain")
        .set("Authorization", `Bearer ${authToken}`)
        .send(explainData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("explanation", mockExplanation);

      expect(geminiHelper.explainText).toHaveBeenCalledWith(
        explainData.highlightedText,
        explainData.context
      );
    });
  });
});
