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
});
