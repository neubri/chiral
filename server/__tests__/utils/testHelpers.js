const { User, Note, Highlight } = require("../../models");
const { signToken } = require("../../helpers/jwt");
const bcrypt = require("bcryptjs");

/**
 * Test Helper Utilities following reference structure
 */
class TestHelpers {
  /**
   * Clean up test data by email
   */
  static async cleanupTestData(email) {
    try {
      await User.destroy({ where: { email } });
    } catch (error) {
      console.warn(`Cleanup warning for ${email}:`, error.message);
    }
  }

  /**
   * Clean up all test data
   */
  static async cleanupAllTestData() {
    try {
      await Highlight.destroy({ where: {} });
      await Note.destroy({ where: {} });
      await User.destroy({ where: {} });
    } catch (error) {
      console.warn("Cleanup warning:", error.message);
    }
  }
  /**
   * Create a test user with valid data
   */
  static async createTestUser(userData = {}) {
    const defaultData = {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      learningInterests: ["React", "Node.js"],
      ...userData,
    };

    // Hash password automatically using the model's beforeCreate hook
    const user = await User.create(defaultData);

    return user;
  }

  /**
   * Generate a valid JWT token for testing
   */
  static generateAuthToken(userId) {
    // Ensure JWT_SECRET is available
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = "test-secret-key";
    }
    return signToken({ id: userId });
  }

  /**
   * Create authenticated user and return both user and token
   */
  static async createAuthenticatedUser(userData = {}) {
    const user = await this.createTestUser(userData);
    const token = this.generateAuthToken(user.id);
    return { user, token };
  }

  /**
   * Create test note with proper validation
   */
  static async createTestNote(userId, noteData = {}) {
    const defaultData = {
      userId,
      title: "Test Note",
      content: "Test Content",
      noteType: "traditional", // Use 'traditional' type to avoid highlight validation
      isFavorite: false,
      ...noteData,
    };

    return await Note.create(defaultData);
  }

  /**
   * Create test highlight with proper validation
   */
  static async createTestHighlight(userId, highlightData = {}) {
    const defaultData = {
      userId,
      articleId: "123",
      articleTitle: "Test Article",
      highlightedText: "Test highlighted text",
      explanation: "Test explanation",
      isBookmarked: false,
      ...highlightData,
    };

    return await Highlight.create(defaultData);
  }

  /**
   * Clean up test data (backwards compatible with email parameter)
   */
  static async cleanupTestData(email = null) {
    if (email) {
      // Clean specific user by email
      await User.destroy({ where: { email } });
    } else {
      // Clean all test data in order to respect foreign key constraints
      await Highlight.destroy({ where: {}, force: true });
      await Note.destroy({ where: {}, force: true });
      await User.destroy({ where: {}, force: true });
    }
  }

  /**
   * Clean up specific user's data
   */
  static async cleanupUserData(userId) {
    await Highlight.destroy({ where: { userId }, force: true });
    await Note.destroy({ where: { userId }, force: true });
    await User.destroy({ where: { id: userId }, force: true });
  }

  /**
   * Generate multiple test users
   */
  static async createMultipleUsers(count = 3) {
    const users = [];
    for (let i = 0; i < count; i++) {
      const user = await this.createTestUser({
        name: `Test User ${i + 1}`,
        email: `test${i + 1}@example.com`,
      });
      users.push(user);
    }
    return users;
  }

  /**
   * Generate multiple test notes for a user
   */
  static async createMultipleNotes(userId, count = 3) {
    const notes = [];
    for (let i = 0; i < count; i++) {
      const note = await this.createTestNote(userId, {
        title: `Note ${i + 1}`,
        content: `Content ${i + 1}`,
        isFavorite: i % 2 === 0, // Alternate favorites
      });
      notes.push(note);
    }
    return notes;
  }

  /**
   * Generate multiple test highlights for a user
   */
  static async createMultipleHighlights(userId, count = 3) {
    const highlights = [];
    for (let i = 0; i < count; i++) {
      const highlight = await this.createTestHighlight(userId, {
        articleId: `article-${Math.floor(i / 2) + 1}`, // Group some highlights
        highlightedText: `Highlighted text ${i + 1}`,
        explanation: `Explanation ${i + 1}`,
        isBookmarked: i % 2 === 0,
      });
      highlights.push(highlight);
    }
    return highlights;
  }

  /**
   * Wait for a specified amount of time (useful for async operations)
   */
  static async wait(ms = 100) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Create a valid login payload
   */
  static getValidLoginPayload(
    email = "test@example.com",
    password = "password123"
  ) {
    return { email, password };
  }

  /**
   * Create a valid registration payload
   */
  static getValidRegisterPayload(userData = {}) {
    return {
      name: "Test User",
      email: "test@example.com",
      password: "password123",
      learningInterests: ["React", "Node.js"],
      ...userData,
    };
  }

  /**
   * Mock external API responses
   */
  static getMockArticles() {
    return [
      {
        id: 1,
        title: "Test Article 1",
        description: "Test description 1",
        url: "https://example.com/1",
        published_at: "2023-01-01T00:00:00Z",
        tag_list: ["react", "javascript"],
        user: { name: "Test Author" },
      },
      {
        id: 2,
        title: "Test Article 2",
        description: "Test description 2",
        url: "https://example.com/2",
        published_at: "2023-01-02T00:00:00Z",
        tag_list: ["nodejs", "backend"],
        user: { name: "Test Author 2" },
      },
    ];
  }

  /**
   * Get test environment variables
   */
  static getTestEnvVars() {
    return {
      JWT_SECRET: process.env.JWT_SECRET || "test_jwt_secret_key",
      GEMINI_API_KEY: process.env.GEMINI_API_KEY || "test_gemini_key",
      NODE_ENV: "test",
    };
  }

  /**
   * Validate response structure
   */
  static validateApiResponse(response, expectedStructure) {
    for (const [key, type] of Object.entries(expectedStructure)) {
      expect(response.body).toHaveProperty(key);
      if (type === "array") {
        expect(Array.isArray(response.body[key])).toBe(true);
      } else if (type === "number") {
        expect(typeof response.body[key]).toBe("number");
      } else if (type === "string") {
        expect(typeof response.body[key]).toBe("string");
      }
    }
  }
}

module.exports = TestHelpers;
