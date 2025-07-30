const request = require("supertest");
const app = require("../app");
const { User } = require("../models");

describe("Auth Controller", () => {
  const testUser = {
    name: "Auth Test User",
    email: "authuser@example.com",
    password: "testpassword",
    learningInterests: ["Node.js", "Express"],
  };

  afterAll(async () => {
    // Clean up test user
    await User.destroy({ where: { email: testUser.email } });
  });

  beforeAll(async () => {
    await User.destroy({ where: { email: testUser.email } });
  });

  describe("POST /api/auth/register", () => {
    it("should register a new user", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      expect([200, 201]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("id");
      expect(response.body.user).toHaveProperty("email", testUser.email);
    });

    it("should not allow duplicate registration", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send(testUser);
      expect([400, 409]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login", () => {
    it("should login with correct credentials", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: testUser.password });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("access_token");
    });

    it("should not login with wrong password", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: testUser.email, password: "wrongpassword" });
      expect([400, 401]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });

    it("should not login with unregistered email", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "notfound@example.com", password: "irrelevant" });
      expect([400, 401, 404]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/register edge cases", () => {
    it("should return 400 if name is missing", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ email: "missingname@example.com", password: "testpassword" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ name: "No Email", password: "testpassword" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/register")
        .send({ name: "No Password", email: "nopassword@example.com" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if email is invalid format", async () => {
      const response = await request(app).post("/api/auth/register").send({
        name: "Bad Email",
        email: "notanemail",
        password: "testpassword",
      });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/login edge cases", () => {
    it("should return 400 if email is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ password: "testpassword" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if password is missing", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "missingpass@example.com" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
    it("should return 400 if email is invalid format", async () => {
      const response = await request(app)
        .post("/api/auth/login")
        .send({ email: "notanemail", password: "testpassword" });
      expect([400, 401, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("POST /api/auth/google", () => {
    it("should return 400 if google token is missing", async () => {
      const response = await request(app)
        .post("/api/auth/google")
        .send({});
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 for invalid google token", async () => {
      const response = await request(app)
        .post("/api/auth/google")
        .send({ googleToken: "invalid_token" });
      expect([400, 401]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/auth/profile", () => {
    let userToken;

    beforeAll(async () => {
      // Clean up any existing test user first
      await User.destroy({ where: { email: "profiletest@example.com" } });

      // Create test user for profile tests
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Profile Test User",
          email: "profiletest@example.com",
          password: "testpassword"
        });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "profiletest@example.com",
          password: "testpassword"
        });
      userToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
      await User.destroy({ where: { email: "profiletest@example.com" } });
    });

    it("should get user profile successfully", async () => {
      const response = await request(app)
        .get("/api/auth/profile")
        .set("Authorization", `Bearer ${userToken}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("user");
      expect(response.body.user).toHaveProperty("email", "profiletest@example.com");
      expect(response.body.user).not.toHaveProperty("password");
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .get("/api/auth/profile");
      expect(response.statusCode).toBe(401);
    });
  });

  describe("PUT /api/auth/interests", () => {
    let userToken;

    beforeAll(async () => {
      // Clean up any existing test user first
      await User.destroy({ where: { email: "interesttest@example.com" } });

      // Create test user for interests tests
      const registerResponse = await request(app)
        .post("/api/auth/register")
        .send({
          name: "Interest Test User",
          email: "interesttest@example.com",
          password: "testpassword"
        });

      const loginResponse = await request(app)
        .post("/api/auth/login")
        .send({
          email: "interesttest@example.com",
          password: "testpassword"
        });
      userToken = loginResponse.body.access_token;
    });

    afterAll(async () => {
      await User.destroy({ where: { email: "interesttest@example.com" } });
    });

    it("should update learning interests successfully", async () => {
      const response = await request(app)
        .put("/api/auth/interests")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ learningInterests: ["React", "Node.js"] });
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty("message");
      expect(response.body).toHaveProperty("learningInterests");
      expect(response.body.learningInterests).toEqual(["React", "Node.js"]);
    });

    it("should handle string learning interest", async () => {
      const response = await request(app)
        .put("/api/auth/interests")
        .set("Authorization", `Bearer ${userToken}`)
        .send({ learningInterests: "JavaScript" });
      expect(response.statusCode).toBe(200);
      expect(response.body.learningInterests).toEqual(["JavaScript"]);
    });

    it("should handle empty learning interests", async () => {
      const response = await request(app)
        .put("/api/auth/interests")
        .set("Authorization", `Bearer ${userToken}`)
        .send({});
      expect(response.statusCode).toBe(200);
      expect(response.body.learningInterests).toEqual([]);
    });

    it("should return 401 if no token provided", async () => {
      const response = await request(app)
        .put("/api/auth/interests")
        .send({ learningInterests: ["Test"] });
      expect(response.statusCode).toBe(401);
    });
  });
});
