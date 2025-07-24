jest.setTimeout(15000);

const request = require("supertest");
const app = require("../app");
const { User, Highlight } = require("../models");

let token;

beforeAll(async () => {
  await request(app).post("/api/auth/register").send({
    name: "Highlight Test User",
    email: "highlighttest@example.com",
    password: "testpassword",
  });
  const login = await request(app).post("/api/auth/login").send({
    email: "highlighttest@example.com",
    password: "testpassword",
  });
  token = login.body.access_token;
});

afterAll(async () => {
  await Highlight.destroy({
    where: {
      userId: (
        await User.findOne({ where: { email: "highlighttest@example.com" } })
      ).id,
    },
  });
  await User.destroy({ where: { email: "highlighttest@example.com" } });
});

describe("Highlight Controller", () => {
  describe("POST /api/highlights", () => {
    it("should create a highlight with explanation", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "1",
          articleTitle: "Test Article",
          articleUrl: "http://example.com/article",
          highlightedText: "Highlight this!",
          context: "Some context for highlight.",
          position: "1-10",
          tags: ["test", "highlight"],
          autoExplain: true,
        });
      expect([200, 201]).toContain(response.status);
      expect(response.body).toHaveProperty("highlight");
      expect(response.body.highlight).toHaveProperty("id");
    });

    it("should return 400 if articleId is missing", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "Test" });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });

    it("should return 400 if highlightedText is missing", async () => {
      const response = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({ articleId: "1" });
      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty("message");
    });
  });

  describe("GET /api/highlights", () => {
    beforeEach(async () => {
      await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "getall-" + Date.now(),
          articleTitle: "Get All Article",
          articleUrl: "http://example.com/getall",
          highlightedText: "Highlight for get all " + Date.now(),
          context: "Context for get all",
          position: "1-10",
          tags: ["getall"],
          autoExplain: false,
        });
    });

    it("should get all highlights for the user", async () => {
      const response = await request(app)
        .get("/api/highlights")
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.highlights)).toBe(true);
    });
  });

  describe("GET /api/highlights/:id", () => {
    let highlightId;
    beforeEach(async () => {
      const res = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "getbyid-" + Date.now(),
          articleTitle: "Get By ID Article",
          articleUrl: "http://example.com/getbyid",
          highlightedText: "Highlight for get by id " + Date.now(),
          context: "Context for get by id",
          position: "1-10",
          tags: ["getbyid"],
          autoExplain: false,
        });
      highlightId = res.body.highlight.id;
    });

    it("should get a highlight by id", async () => {
      const response = await request(app)
        .get(`/api/highlights/${highlightId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty("highlight");
      expect(response.body.highlight).toHaveProperty("id", highlightId);
    });
  });

  it("should return 400 if highlightedText is too long", async () => {
    const longText = "a".repeat(5001);
    const response = await request(app)
      .post("/api/highlights")
      .set("Authorization", `Bearer ${token}`)
      .send({
        articleId: "1",
        articleTitle: "Long Text Article",
        articleUrl: "http://example.com/longtext",
        highlightedText: longText,
      });
    expect(response.status).toBe(400);
    expect(response.body).toHaveProperty("message");
  });

  it("should create a highlight without explanation if autoExplain is false", async () => {
    const response = await request(app)
      .post("/api/highlights")
      .set("Authorization", `Bearer ${token}`)
      .send({
        articleId: "2",
        articleTitle: "No Explain Article",
        articleUrl: "http://example.com/noexplain",
        highlightedText: "No explain",
        autoExplain: false,
      });
    expect([200, 201]).toContain(response.status);
    expect(response.body.highlight).toHaveProperty("explanation", null);
  });

  describe("PATCH /api/highlights/:id", () => {
    let patchHighlightId;
    beforeEach(async () => {
      const res = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "patch-" + Date.now(),
          articleTitle: "Patch Article",
          articleUrl: "http://example.com/patch",
          highlightedText: "Highlight for patch test " + Date.now(),
          context: "Context for patch",
          position: "1-10",
          tags: ["patch"],
          autoExplain: false,
        });
      patchHighlightId = res.body.highlight.id;
    });

    it("should update a highlight's text", async () => {
      const response = await request(app)
        .patch(`/api/highlights/${patchHighlightId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "Updated text" });
      expect(response.status).toBe(200);
      expect(response.body.highlight).toHaveProperty(
        "highlightedText",
        "Updated text"
      );
    });

    it("should return 404 if highlight not found", async () => {
      const response = await request(app)
        .patch(`/api/highlights/999999`)
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: "Doesn't matter" });
      expect(response.status).toBe(404);
    });

    it("should return 400 if updated text is too long", async () => {
      const longText = "a".repeat(5001);
      const response = await request(app)
        .patch(`/api/highlights/${patchHighlightId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ highlightedText: longText });
      expect(response.status).toBe(400);
    });
  });

  describe("DELETE /api/highlights/:id", () => {
    it("should delete a highlight", async () => {
      const newHighlight = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "3",
          articleTitle: "Delete Article",
          articleUrl: "http://example.com/delete",
          highlightedText: "To delete",
        });
      const del = await request(app)
        .delete(`/api/highlights/${newHighlight.body.highlight.id}`)
        .set("Authorization", `Bearer ${token}`);
      expect(del.status).toBe(200);
      expect(del.body).toHaveProperty("message");
    });
    it("should return 404 if highlight not found", async () => {
      const response = await request(app)
        .delete(`/api/highlights/999999`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
    });
  });

  describe("GET /api/highlights/article/:articleId", () => {
    let articleId;
    let articleHighlightId;
    beforeEach(async () => {
      articleId = "article-" + Date.now();
      const res = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId,
          articleTitle: "Get By Article Article",
          articleUrl: "http://example.com/getbyarticle",
          highlightedText: "Highlight for article test " + Date.now(),
          context: "Context for article",
          position: "1-10",
          tags: ["getbyarticle"],
          autoExplain: false,
        });
      articleHighlightId = res.body.highlight.id;
    });

    it("should get highlights for an article", async () => {
      const response = await request(app)
        .get(`/api/highlights/article/${articleId}`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(200);
      expect(Array.isArray(response.body.highlights)).toBe(true);
      expect(
        response.body.highlights.some((h) => h.id === articleHighlightId)
      ).toBe(true);
    });
  });

  describe("GET /api/highlights/:id/explain", () => {
    let explainHighlightId;
    beforeEach(async () => {
      const res = await request(app)
        .post("/api/highlights")
        .set("Authorization", `Bearer ${token}`)
        .send({
          articleId: "explain-" + Date.now(),
          articleTitle: "Explain Article",
          articleUrl: "http://example.com/explain",
          highlightedText: "Highlight for explain test " + Date.now(),
          context: "Context for explain",
          position: "1-10",
          tags: ["explain"],
          autoExplain: false,
        });
      explainHighlightId = res.body.highlight.id;
    });

    it("should get explanation for a highlight", async () => {
      const response = await request(app)
        .get(`/api/highlights/${explainHighlightId}/explain`)
        .set("Authorization", `Bearer ${token}`);
      expect([200, 404]).toContain(response.status);
      if (response.status === 200) {
        expect(response.body).toHaveProperty("explanation");
      }
    });
    it("should return 404 if highlight not found", async () => {
      const response = await request(app)
        .get(`/api/highlights/999999/explain`)
        .set("Authorization", `Bearer ${token}`);
      expect(response.status).toBe(404);
    });
  });
});
