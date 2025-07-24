const geminiHelper = require("../helpers/gemini");
const bcrypt = require("../helpers/bcrypt");
const jwt = require("../helpers/jwt");

// Mock the GoogleGenerativeAI
jest.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: jest.fn().mockImplementation(() => ({
    getGenerativeModel: jest.fn().mockReturnValue({
      generateContent: jest.fn().mockResolvedValue({
        response: {
          text: jest.fn().mockReturnValue("Mocked AI explanation"),
        },
      }),
    }),
  })),
}));

describe("Helpers", () => {
  describe("bcrypt helper", () => {
    it("should hash and compare passwords correctly", async () => {
      const password = "testpassword";
      const hashedPassword = bcrypt.hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);

      const isValid = bcrypt.comparePassword(password, hashedPassword);
      expect(isValid).toBe(true);

      const isInvalid = bcrypt.comparePassword("wrongpassword", hashedPassword);
      expect(isInvalid).toBe(false);
    });
  });

  describe("jwt helper", () => {
    it("should sign and verify tokens correctly", () => {
      const payload = { id: 1, email: "test@example.com" };
      const token = jwt.signToken(payload);

      expect(token).toBeDefined();
      expect(typeof token).toBe("string");

      const decoded = jwt.verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it("should throw error for invalid token", () => {
      expect(() => {
        jwt.verifyToken("invalid.token.here");
      }).toThrow();
    });
  });

  describe("gemini helper", () => {
    const { GoogleGenerativeAI } = require("@google/generative-ai");

    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("should explain text successfully", async () => {
      const highlightedText = "React is a JavaScript library";
      const context = "This is about web development";

      const result = await explainWithGemini(highlightedText, context);

      expect(result).toBe("Mocked AI explanation");
      expect(GoogleGenerativeAI).toHaveBeenCalled();
    });

    it("should explain text without context", async () => {
      const highlightedText = "React is a JavaScript library";

      const result = await explainWithGemini(highlightedText);

      expect(result).toBe("Mocked AI explanation");
    });

    it("should handle empty text", async () => {
      const result = await explainWithGemini("");
      expect(result).toBe("Mocked AI explanation");
    });

    it("should handle API errors", async () => {
      const mockModel = {
        generateContent: jest.fn().mockRejectedValue(new Error("API Error")),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      await expect(explainWithGemini("test text")).rejects.toThrow("API Error");
    });

    it("should handle rate limiting errors", async () => {
      const mockModel = {
        generateContent: jest
          .fn()
          .mockRejectedValue(new Error("RATE_LIMIT_EXCEEDED")),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      await expect(explainWithGemini("test text")).rejects.toThrow(
        "RATE_LIMIT_EXCEEDED"
      );
    });

    it("should handle invalid API key errors", async () => {
      const mockModel = {
        generateContent: jest
          .fn()
          .mockRejectedValue(new Error("INVALID_API_KEY")),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      await expect(explainWithGemini("test text")).rejects.toThrow(
        "INVALID_API_KEY"
      );
    });

    it("should handle safety concerns", async () => {
      const mockModel = {
        generateContent: jest.fn().mockResolvedValue({
          response: {
            text: jest
              .fn()
              .mockReturnValue("Content blocked due to safety concerns"),
          },
        }),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      const result = await explainWithGemini("potentially harmful content");
      expect(result).toBe("Content blocked due to safety concerns");
    });

    it("should handle timeout errors", async () => {
      const mockModel = {
        generateContent: jest
          .fn()
          .mockRejectedValue(new Error("Request timeout")),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      await expect(explainWithGemini("test text")).rejects.toThrow(
        "Request timeout"
      );
    });

    it("should handle network errors", async () => {
      const mockModel = {
        generateContent: jest
          .fn()
          .mockRejectedValue(new Error("Network error")),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      await expect(explainWithGemini("test text")).rejects.toThrow(
        "Network error"
      );
    });

    it("should handle model overload errors", async () => {
      const mockModel = {
        generateContent: jest
          .fn()
          .mockRejectedValue(new Error("Model overloaded")),
      };

      GoogleGenerativeAI.mockImplementation(() => ({
        getGenerativeModel: jest.fn().mockReturnValue(mockModel),
      }));

      await expect(explainWithGemini("test text")).rejects.toThrow(
        "Model overloaded"
      );
    });
  });
});
