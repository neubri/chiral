const errorHandler = require("../middlewares/errorHandler");

describe("errorHandler middleware", () => {
  let req, res, next;
  beforeEach(() => {
    req = {};
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
    };
    next = jest.fn();
    process.env.NODE_ENV = "test";
  });

  it("handles SequelizeValidationError", () => {
    const error = {
      name: "SequelizeValidationError",
      errors: [{ message: "Validation failed" }],
    };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Validation failed" });
  });

  it("handles SequelizeUniqueConstraintError", () => {
    const error = {
      name: "SequelizeUniqueConstraintError",
      errors: [{ message: "Unique constraint" }],
    };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Unique constraint" });
  });

  it("handles SequelizeDatabaseError", () => {
    const error = { name: "SequelizeDatabaseError" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database error occurred",
    });
  });

  it("handles SequelizeConnectionError", () => {
    const error = { name: "SequelizeConnectionError" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({
      message: "Database connection failed",
    });
  });

  it("handles Bad Request", () => {
    const error = { name: "Bad Request", message: "Bad input" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({ message: "Bad input" });
  });

  it("handles Not Found", () => {
    const error = { name: "Not Found", message: "Not found" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({ message: "Not found" });
  });

  it("handles Unauthorized", () => {
    const error = { name: "Unauthorized", message: "No access" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "No access" });
  });

  it("handles Forbidden", () => {
    const error = { name: "Forbidden", message: "Forbidden" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ message: "Forbidden" });
  });

  it("handles JsonWebTokenError", () => {
    const error = { name: "JsonWebTokenError" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Invalid token" });
  });

  it("handles TokenExpiredError", () => {
    const error = { name: "TokenExpiredError" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ message: "Token expired" });
  });

  it("handles PayloadTooLargeError", () => {
    const error = { name: "PayloadTooLargeError" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(413);
    expect(res.json).toHaveBeenCalledWith({
      message: "Request payload too large",
    });
  });

  it("handles Service Unavailable", () => {
    const error = { name: "Service Unavailable", message: "Down" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(503);
    expect(res.json).toHaveBeenCalledWith({ message: "Down" });
  });

  it("handles unknown error in production", () => {
    process.env.NODE_ENV = "production";
    const error = { name: "Other", message: "Should not show" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Internal server error" });
  });

  it("handles unknown error in development", () => {
    process.env.NODE_ENV = "development";
    const error = { name: "Other", message: "Show this" };
    errorHandler(error, req, res, next);
    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ message: "Show this" });
  });
});
