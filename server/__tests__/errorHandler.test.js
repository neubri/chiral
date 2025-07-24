const errorHandler = require("../middlewares/errorHandler");

describe("Error Handler Middleware", () => {
  let mockReq, mockRes, mockNext;

  beforeEach(() => {
    mockReq = {};
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    mockNext = jest.fn();
  });

  it("should handle ValidationError", () => {
    const error = {
      name: "SequelizeValidationError",
      errors: [
        { message: "Email is required" },
        { message: "Password is required" },
      ],
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Email is required, Password is required",
    });
  });

  it("should handle UniqueConstraintError", () => {
    const error = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ message: "Email already exists" }],
    };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Email already exists",
    });
  });

  it("should handle JsonWebTokenError", () => {
    const error = { name: "JsonWebTokenError" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid token",
    });
  });

  it("should handle TokenExpiredError", () => {
    const error = { name: "TokenExpiredError" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Token expired",
    });
  });

  it("should handle Unauthorized error", () => {
    const error = { name: "Unauthorized", message: "Access denied" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Access denied",
    });
  });

  it("should handle Forbidden error", () => {
    const error = { name: "Forbidden", message: "Access forbidden" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(403);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Access forbidden",
    });
  });

  it("should handle Not Found error", () => {
    const error = { name: "Not Found", message: "Resource not found" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(404);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Resource not found",
    });
  });

  it("should handle Bad Request error", () => {
    const error = { name: "Bad Request", message: "Invalid data" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(400);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Invalid data",
    });
  });

  it("should handle internal server error", () => {
    const error = { message: "Something went wrong" };

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });

  it("should handle error without message", () => {
    const error = {};

    errorHandler(error, mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(500);
    expect(mockRes.json).toHaveBeenCalledWith({
      message: "Internal server error",
    });
  });
});
