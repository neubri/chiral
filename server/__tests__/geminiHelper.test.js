const GeminiHelper = require("../helpers/gemini");

describe("GeminiHelper", () => {
  let gemini;
  beforeEach(() => {
    process.env.GEMINI_API_KEY = "dummy";
    gemini = new GeminiHelper.constructor();
  });

  it("should throw error if explainText fails with 429", async () => {
    gemini.model = {
      generateContent: jest.fn().mockRejectedValue({ status: 429 }),
    };
    await expect(gemini.explainText("test")).rejects.toThrow(
      "Rate limit exceeded"
    );
  });

  it("should throw error if explainText fails with 503", async () => {
    gemini.model = {
      generateContent: jest.fn().mockRejectedValue({ status: 503 }),
    };
    await expect(gemini.explainText("test")).rejects.toThrow(
      "Gemini AI service is temporarily unavailable"
    );
  });

  it("should throw error if explainText fails with API key error", async () => {
    gemini.model = {
      generateContent: jest
        .fn()
        .mockRejectedValue({ message: "API key missing" }),
    };
    await expect(gemini.explainText("test")).rejects.toThrow(
      "AI service configuration error"
    );
  });

  it("should throw generic error if explainText fails with unknown error", async () => {
    gemini.model = {
      generateContent: jest.fn().mockRejectedValue({ message: "other error" }),
    };
    await expect(gemini.explainText("test")).rejects.toThrow(
      "Failed to generate explanation"
    );
  });
});
