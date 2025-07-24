const {
  authenticateToken,
  optionalAuth,
} = require("../middlewares/authentication");
const jwt = require("jsonwebtoken");

jest.mock("../models", () => ({
  User: {
    findByPk: jest.fn(),
  },
}));
const { User } = require("../models");

describe("authentication middleware", () => {
  let req, res, next;
  const user = { id: 1, email: "test@mail.com" };
  const secret = "testsecret";
  let token;

  beforeAll(() => {
    process.env.JWT_SECRET = secret;
    token = jwt.sign({ id: user.id }, secret);
  });

  beforeEach(() => {
    req = { headers: {} };
    res = {};
    next = jest.fn();
    User.findByPk.mockReset();
  });

  describe("authenticateToken", () => {
    it("should call next with user if token is valid", async () => {
      req.headers.authorization = `Bearer ${token}`;
      User.findByPk.mockResolvedValue(user);
      await authenticateToken(req, res, next);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalledWith();
    });

    it("should call next with Unauthorized if no token", async () => {
      await authenticateToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Unauthorized" })
      );
    });

    it("should call next with Unauthorized if user not found", async () => {
      req.headers.authorization = `Bearer ${token}`;
      User.findByPk.mockResolvedValue(null);
      await authenticateToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Unauthorized" })
      );
    });

    it("should call next with error if token is invalid", async () => {
      req.headers.authorization = "Bearer invalidtoken";
      await authenticateToken(req, res, next);
      expect(next).toHaveBeenCalledWith(
        expect.objectContaining({ message: "Invalid token" })
      );
    });
  });

  describe("optionalAuth", () => {
    it("should set req.user if token is valid", async () => {
      req.headers.authorization = `Bearer ${token}`;
      User.findByPk.mockResolvedValue(user);
      await optionalAuth(req, res, next);
      expect(req.user).toEqual(user);
      expect(next).toHaveBeenCalledWith();
    });

    it("should not set req.user if no token", async () => {
      await optionalAuth(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });

    it("should not set req.user if token is invalid", async () => {
      req.headers.authorization = "Bearer invalidtoken";
      await optionalAuth(req, res, next);
      expect(req.user).toBeUndefined();
      expect(next).toHaveBeenCalledWith();
    });
  });
});
