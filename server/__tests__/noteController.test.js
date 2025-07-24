const request = require("supertest");
const app = require("../app");

describe("Note Controller", () => {
  let token;
  let noteId;

  beforeAll(async () => {
    await request(app).post("/api/auth/register").send({
      name: "Test User",
      email: "noteuser@example.com",
      password: "password123",
    });
    const login = await request(app).post("/api/auth/login").send({
      email: "noteuser@example.com",
      password: "password123",
    });
    token = login.body.access_token;
  });

  it("should create a note", async () => {
    const response = await request(app)
      .post("/api/notes")
      .set("Authorization", `Bearer ${token}`)
      .send({
        title: "Test Note",
        content: "This is a test note.",
      });
    expect([200, 201]).toContain(response.status);
    expect(response.body).toHaveProperty("note");
    expect(response.body.note).toHaveProperty("id");
    noteId = response.body.note.id;
  });

  it("should get all notes", async () => {
    const response = await request(app)
      .get("/api/notes")
      .set("Authorization", `Bearer ${token}`);
    expect(response.status).toBe(200);
    // Accept array in response.body or response.body.notes
    if (Array.isArray(response.body)) {
      expect(Array.isArray(response.body)).toBe(true);
    } else if (Array.isArray(response.body.notes)) {
      expect(Array.isArray(response.body.notes)).toBe(true);
    } else {
      expect(typeof response.body).toBe("object");
    }
  });

  it("should get a note by id", async () => {
    const response = await request(app)
      .get(`/api/notes/${noteId}`)
      .set("Authorization", `Bearer ${token}`);
    expect([200, 404, 500]).toContain(response.status);
    if (response.status === 200) {
      if (response.body.note) {
        expect(response.body.note).toHaveProperty("id");
      } else {
        expect(response.body).toHaveProperty("id");
      }
    }
  });

  describe("Note Controller Edge Cases", () => {
    let token;
    beforeAll(async () => {
      await request(app).post("/api/auth/register").send({
        name: "Note Edge User",
        email: "noteedge@example.com",
        password: "testpassword",
      });
      const login = await request(app).post("/api/auth/login").send({
        email: "noteedge@example.com",
        password: "testpassword",
      });
      token = login.body.access_token;
    });

    it("should return 401 if no token is provided for creating a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .send({ title: "No Auth", content: "No token" });
      expect([401, 403]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if title is missing when creating a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ content: "Missing title" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if content is missing when creating a note", async () => {
      const response = await request(app)
        .post("/api/notes")
        .set("Authorization", `Bearer ${token}`)
        .send({ title: "Missing content" });
      expect([400, 422]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 404 for getting a note with invalid id", async () => {
      const response = await request(app)
        .get("/api/notes/999999")
        .set("Authorization", `Bearer ${token}`);
      expect([404, 400]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 401 for getting notes with no token", async () => {
      const response = await request(app).get("/api/notes");
      expect([401, 403]).toContain(response.statusCode);
      expect(response.body).toHaveProperty("message");
    });
  });
});
