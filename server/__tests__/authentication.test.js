const { authenticateToken } = require("../middlewares/authentication");
const { User } = require("../models");
const jwt = require("jsonwebtoken");

jest.mock("../models");
jest.mock("jsonwebtoken");

describe("Authentication Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {};
    mockNext = jest.fn();
    jest.clearAllMocks();
  });

  it("should authenticate user with valid token", async () => {
    const mockUser = { id: 1, email: "test@example.com" };
    mockReq.headers.authorization = "Bearer validtoken";

    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(mockUser);

    await authenticateToken(mockReq, mockRes, mockNext);

    expect(jwt.verify).toHaveBeenCalledWith(
      "validtoken",
      process.env.JWT_SECRET
    );
    expect(User.findByPk).toHaveBeenCalledWith(1);
    expect(mockReq.user).toEqual(mockUser);
    expect(mockNext).toHaveBeenCalledWith();
  });

  it("should throw error when no authorization header", async () => {
    await authenticateToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      name: "Unauthorized",
      message: "Access token required",
    });
  });

  it("should throw error when invalid token format", async () => {
    mockReq.headers.authorization = "InvalidFormat";

    await authenticateToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      name: "Unauthorized",
      message: "Access token required",
    });
  });

  it("should throw error when token verification fails", async () => {
    mockReq.headers.authorization = "Bearer invalidtoken";
    jwt.verify.mockImplementation(() => {
      throw new Error("Invalid token");
    });

    await authenticateToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });

  it("should throw error when user not found", async () => {
    mockReq.headers.authorization = "Bearer validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockResolvedValue(null);

    await authenticateToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith({
      name: "Unauthorized",
      message: "Invalid token",
    });
  });

  it("should handle database errors", async () => {
    mockReq.headers.authorization = "Bearer validtoken";
    jwt.verify.mockReturnValue({ id: 1 });
    User.findByPk.mockRejectedValue(new Error("Database error"));

    await authenticateToken(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalledWith(expect.any(Error));
  });
});
