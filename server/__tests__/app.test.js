const request = require("supertest");
const app = require("../app");

describe("App", () => {
  describe("GET /", () => {
    it("should return health check message", async () => {
      const response = await request(app).get("/");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Chiral server is running!"
      );
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("version", "1.0.0");
    });
  });

  describe("GET /api/health", () => {
    it("should return health check message", async () => {
      const response = await request(app).get("/api/health");

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty(
        "message",
        "Chiral server is running!"
      );
      expect(response.body).toHaveProperty("timestamp");
      expect(response.body).toHaveProperty("version", "1.0.0");
    });
  });

  describe("Invalid routes", () => {
    it("should return 404 for non-existent routes", async () => {
      const response = await request(app).get("/non-existent-route");

      expect(response.status).toBe(404);
    });
  });
});
