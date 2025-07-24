const { signToken, verifyToken } = require("../helpers/jwt");
const jwt = require("jsonwebtoken");

describe("jwt helper", () => {
  const payload = { id: 1, email: "test@mail.com" };
  const secret = "testsecret";
  let originalEnv;

  beforeAll(() => {
    originalEnv = process.env.JWT_SECRET;
    process.env.JWT_SECRET = secret;
  });

  afterAll(() => {
    process.env.JWT_SECRET = originalEnv;
  });

  describe("signToken", () => {
    it("should return a valid JWT token", () => {
      const token = signToken(payload);
      expect(typeof token).toBe("string");
      const decoded = jwt.verify(token, secret);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });
  });

  describe("verifyToken", () => {
    it("should verify a valid token and return the payload", () => {
      const token = jwt.sign(payload, secret);
      const decoded = verifyToken(token);
      expect(decoded.id).toBe(payload.id);
      expect(decoded.email).toBe(payload.email);
    });

    it("should throw error for invalid token", () => {
      expect(() => verifyToken("invalid.token")).toThrow();
    });
  });
});
