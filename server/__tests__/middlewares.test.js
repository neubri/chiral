const request = require("supertest");
const express = require("express");
const authentication = require("../middlewares/authentication");
const errorHandler = require("../middlewares/errorHandler");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const setupTestDatabase = require("./setup");

const app = express();
app.use(express.json());

// Test route to check authentication
app.get("/protected", authentication, (req, res) => {
  res.json({ userId: req.user.id, message: "Access granted" });
});

// Test route to check error handling
app.get("/error", (req, res, next) => {
  const error = new Error("Test error");
  error.status = 400;
  next(error);
});

app.get("/validation-error", (req, res, next) => {
  const error = new Error("Validation failed");
  error.name = "SequelizeValidationError";
  error.errors = [
    { path: "email", message: "Email is required" },
    { path: "password", message: "Password is too short" },
  ];
  next(error);
});

app.get("/unique-constraint-error", (req, res, next) => {
  const error = new Error("Unique constraint failed");
  error.name = "SequelizeUniqueConstraintError";
  error.errors = [{ path: "email", message: "Email already exists" }];
  next(error);
});

app.get("/cast-error", (req, res, next) => {
  const error = new Error("Cast error");
  error.name = "CastError";
  next(error);
});

app.get("/json-web-token-error", (req, res, next) => {
  const error = new Error("JWT malformed");
  error.name = "JsonWebTokenError";
  next(error);
});

app.get("/token-expired-error", (req, res, next) => {
  const error = new Error("JWT expired");
  error.name = "TokenExpiredError";
  next(error);
});

app.get("/unknown-error", (req, res, next) => {
  const error = new Error("Unknown error");
  next(error);
});

app.use(errorHandler);

describe("Middlewares", () => {
  let testUser;

  beforeAll(async () => {
    await setupTestDatabase();
  });

  afterAll(async () => {
    await setupTestDatabase.close();
  });

  beforeEach(async () => {
    // Clean and create test user
    await User.destroy({ where: { email: "middleware@test.com" } });
    testUser = await User.create({
      name: "Middleware Test User",
      email: "middleware@test.com",
      password: "hashedpassword123",
      learningInterests: ["testing"],
    });
  });

  describe("Authentication Middleware", () => {
    it("should allow access with valid token", async () => {
      const token = signToken({ id: testUser.id });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty("userId", testUser.id);
      expect(response.body).toHaveProperty("message", "Access granted");
    });

    it("should reject access without token", async () => {
      const response = await request(app).get("/protected").expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should reject access with invalid token format", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "InvalidToken")
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Access token is required"
      );
    });

    it("should reject access with malformed token", async () => {
      const response = await request(app)
        .get("/protected")
        .set("Authorization", "Bearer invalid.token.here")
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid access token");
    });

    it("should reject access for non-existent user", async () => {
      const token = signToken({ id: 99999 });

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`)
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid access token");
    });

    it("should handle database errors", async () => {
      const token = signToken({ id: testUser.id });

      // Mock User.findByPk to throw an error
      const originalFindByPk = User.findByPk;
      User.findByPk = jest.fn().mockRejectedValue(new Error("Database error"));

      const response = await request(app)
        .get("/protected")
        .set("Authorization", `Bearer ${token}`)
        .expect(500);

      expect(response.body).toHaveProperty("message", "Internal Server Error");

      // Restore original method
      User.findByPk = originalFindByPk;
    });
  });

  describe("Error Handler Middleware", () => {
    it("should handle custom error with status", async () => {
      const response = await request(app).get("/error").expect(400);

      expect(response.body).toHaveProperty("message", "Test error");
    });

    it("should handle Sequelize validation errors", async () => {
      const response = await request(app).get("/validation-error").expect(400);

      expect(response.body).toHaveProperty("message", "Validation failed");
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toHaveProperty("email", "Email is required");
      expect(response.body.errors).toHaveProperty(
        "password",
        "Password is too short"
      );
    });

    it("should handle Sequelize unique constraint errors", async () => {
      const response = await request(app)
        .get("/unique-constraint-error")
        .expect(400);

      expect(response.body).toHaveProperty(
        "message",
        "Unique constraint failed"
      );
      expect(response.body).toHaveProperty("errors");
      expect(response.body.errors).toHaveProperty(
        "email",
        "Email already exists"
      );
    });

    it("should handle cast errors", async () => {
      const response = await request(app).get("/cast-error").expect(400);

      expect(response.body).toHaveProperty("message", "Invalid data format");
    });

    it("should handle JWT errors", async () => {
      const response = await request(app)
        .get("/json-web-token-error")
        .expect(401);

      expect(response.body).toHaveProperty("message", "Invalid access token");
    });

    it("should handle expired JWT errors", async () => {
      const response = await request(app)
        .get("/token-expired-error")
        .expect(401);

      expect(response.body).toHaveProperty(
        "message",
        "Access token has expired"
      );
    });

    it("should handle unknown errors", async () => {
      const response = await request(app).get("/unknown-error").expect(500);

      expect(response.body).toHaveProperty("message", "Internal Server Error");
    });
  });
});
