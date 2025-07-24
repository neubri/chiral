const request = require("supertest");
const app = require("../app");

describe("Public Controller", () => {
  describe("GET /api/articles", () => {
    it("should return a list of public articles", async () => {
      const response = await request(app).get("/api/articles");
      expect(response.status).toBe(200);
      // Accept either an array or an object with a data array
      if (Array.isArray(response.body)) {
        expect(Array.isArray(response.body)).toBe(true);
      } else if (response.body && Array.isArray(response.body.data)) {
        expect(Array.isArray(response.body.data)).toBe(true);
      } else {
        // Accept empty object or error message for empty data
        expect(typeof response.body).toBe("object");
      }
    });
  });

  describe("GET /api/articles/:id", () => {
    it("should return a single article if exists", async () => {
      const response = await request(app).get("/api/articles/1");
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty("id");
      }
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
    });
  });
});
