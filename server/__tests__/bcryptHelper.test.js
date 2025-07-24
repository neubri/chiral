const { hashPassword, comparePassword } = require("../helpers/bcrypt");
const bcrypt = require("bcryptjs");

describe("bcrypt helper", () => {
  const password = "supersecret";

  describe("hashPassword", () => {
    it("should return a hashed password", () => {
      const hash = hashPassword(password);
      expect(typeof hash).toBe("string");
      expect(hash).not.toBe(password);
      expect(bcrypt.compareSync(password, hash)).toBe(true);
    });
  });

  describe("comparePassword", () => {
    it("should return true for correct password", () => {
      const hash = bcrypt.hashSync(password, 10);
      expect(comparePassword(password, hash)).toBe(true);
    });

    it("should return false for incorrect password", () => {
      const hash = bcrypt.hashSync(password, 10);
      expect(comparePassword("wrongpassword", hash)).toBe(false);
    });
  });
});
