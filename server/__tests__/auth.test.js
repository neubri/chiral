const request = require("supertest");
const app = require("../app");
const TestHelpers = require("./utils/testHelpers");

describe("Authentication", () => {
  let testUser;
  let authToken;

  beforeEach(async () => {
    // Clean up test user
    await TestHelpers.cleanupTestData("test@example.com");

    // Create test user using helper
    const { user, token } = await TestHelpers.createAuthenticatedUser();
    testUser = user;
    authToken = token;
  });

  afterEach(async () => {
    // Clean up
    await TestHelpers.cleanupTestData("test@example.com");
    await TestHelpers.cleanupTestData("newuser@example.com");
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user successfully", async () => {
      const userData = {
        name: "New User",
        email: "newuser@example.com",
        password: "password123",
        learningInterests: ["JavaScript", "React"],
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty(
        "message",
        "User registered successfully"
      );
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name", userData.name);
      expect(response.body.user).toHaveProperty("email", userData.email);
      expect(response.body.user).toHaveProperty("learningInterests");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return error if email already exists", async () => {
      const userData = {
        name: "Test User 2",
        email: "test@example.com", // Already exists
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error if required fields are missing", async () => {
      const userData = {
        name: "Test User",
        // missing email and password
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error if email format is invalid", async () => {
      const userData = {
        name: "Test User",
        email: "invalid-email",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error if password is too short", async () => {
      const userData = {
        name: "Test User",
        email: "test2@example.com",
        password: "123", // Too short
      };

      const response = await request(app)
        .post("/api/auth/register")
        .send(userData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login successfully with valid credentials", async () => {
      const loginData = {
        email: "test@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("message", "Login successful");
      expect(response.body).toHaveProperty("access_token");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("email", loginData.email);
      expect(response.body.user).not.toHaveProperty("password");

      authToken = response.body.access_token;
    });

    it("should return error with invalid email", async () => {
      const loginData = {
        email: "nonexistent@example.com",
        password: "password123",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error with invalid password", async () => {
      const loginData = {
        email: "test@example.com",
        password: "wrongpassword",
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error if required fields are missing", async () => {
      const loginData = {
        email: "test@example.com",
        // missing password
      };

      const response = await request(app)
        .post("/api/auth/login")
        .send(loginData);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/auth/profile", () => {
    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });
      authToken = loginResponse.body.access_token;
    });

    it("should return user profile with valid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("name", "Test User");
      expect(response.body.user).toHaveProperty("email", "test@example.com");
      expect(response.body.user).toHaveProperty("learningInterests");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return error without token", async () => {
      const response = await request(app).get("/api/auth/profile");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error with invalid token", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", "Bearer invalid-token");

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("PUT /api/auth/interests", () => {
    beforeEach(async () => {
      // Login to get token
      const loginResponse = await request(app).post("/api/auth/login").send({
        email: "test@example.com",
        password: "password123",
      });
      authToken = loginResponse.body.access_token;
    });

    it("should update learning interests successfully", async () => {
      const newInterests = ["Vue.js", "TypeScript", "GraphQL"];

      const response = await request(app)
        .put("/api/auth/interests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ learningInterests: newInterests });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Learning interests updated successfully"
      );
      expect(response.body.learningInterests).toEqual(newInterests);
    });

    it("should return error without token", async () => {
      const response = await request(app)
        .put("/api/auth/interests")
        .send({ learningInterests: ["Vue.js"] });

      expect(response.status).toBe(401);
      expect(response.body).toHaveProperty("message");
    });

    it("should return error with invalid interests format", async () => {
      const response = await request(app)
        .put("/api/auth/interests")
        .set("Authorization", `Bearer ${authToken}`)
        .send({ learningInterests: "not-an-array" });

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });
});
