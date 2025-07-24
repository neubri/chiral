const GoogleAuthHelper = require("../helpers/googleAuth");

describe("GoogleAuthHelper", () => {
  let originalEnv;
  beforeAll(() => {
    originalEnv = process.env.GOOGLE_CLIENT_ID;
    process.env.GOOGLE_CLIENT_ID = "dummy-client-id";
  });
  afterAll(() => {
    process.env.GOOGLE_CLIENT_ID = originalEnv;
  });

  it("should throw Bad Request error for invalid token", async () => {
    // Mock the client to always throw
    GoogleAuthHelper.client = {
      verifyIdToken: jest.fn().mockRejectedValue(new Error("invalid token")),
    };
    await expect(
      GoogleAuthHelper.verifyIdToken("badtoken")
    ).rejects.toMatchObject({
      name: "Bad Request",
      message: "Invalid Google token",
    });
  });

  it("should return user info for valid token", async () => {
    const fakePayload = {
      sub: "123",
      email: "test@mail.com",
      name: "Test User",
      picture: "pic.jpg",
      email_verified: true,
    };
    GoogleAuthHelper.client = {
      verifyIdToken: jest.fn().mockResolvedValue({
        getPayload: () => fakePayload,
      }),
    };
    const result = await GoogleAuthHelper.verifyIdToken("goodtoken");
    expect(result).toEqual({
      googleId: "123",
      email: "test@mail.com",
      name: "Test User",
      picture: "pic.jpg",
      emailVerified: true,
    });
  });
});
