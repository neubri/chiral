const request = require("supertest");
const app = require("../app");
const { User, Note } = require("../models");
const jwt = require("jsonwebtoken");

describe("Note Controller Missing Branch Coverage", () => {
  let token;
  let userId;
  let noteId;

  beforeAll(async () => {
    // Create a user for testing
    const user = await User.create({
      name: "Branch Test User",
      email: "branchtest@example.com",
      password: "hashedpassword123",
      learningInterests: ["testing"],
    });
    userId = user.id;
    token = jwt.sign(
      { id: user.id, email: user.email },
      process.env.JWT_SECRET || "test-secret",
      { expiresIn: "1h" }
    );

    // Create a highlight note for testing updates
    const note = await Note.create({
      userId: userId,
      highlightedText: "Initial highlighted text",
      explanation: "Initial explanation",
      originalContext: "Initial context",
      noteType: "highlight",
      isFavorite: false,
    });
    noteId = note.id;
  });

  afterAll(async () => {
    // Clean up
    await Note.destroy({ where: { userId } });
    await User.destroy({ where: { id: userId } });
  });

  it("should cover originalContext undefined branch in update", async () => {
    // This test specifically targets the uncovered branch at line 218
    // by updating a highlight note WITHOUT providing originalContext
    const response = await request(app)
      .put(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`)
      .send({
        highlightedText: "Updated highlighted text",
        explanation: "Updated explanation",
        // NOTE: originalContext is intentionally NOT provided (undefined)
        // This should trigger the line 218 branch: if (originalContext !== undefined)
      });

    expect(response.status).toBe(200);
    expect(response.body.note.highlightedText).toBe("Updated highlighted text");
    expect(response.body.note.explanation).toBe("Updated explanation");
    // originalContext should remain unchanged from the original value
    expect(response.body.note.originalContext).toBe("Initial context");
  });
});
