const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");

class AuthController {
  static async register(req, res, next) {
    try {
      const { name, email, password, learningInterests } = req.body;

      if (!name) {
        throw { name: "Bad Request", message: "Name is required" };
      }

      if (!email) {
        throw { name: "Bad Request", message: "Email is required" };
      }

      if (!password) {
        throw { name: "Bad Request", message: "Password is required" };
      }

      // Handle learningInterests properly - convert string to array if needed
      let processedLearningInterests = [];
      if (learningInterests) {
        if (Array.isArray(learningInterests)) {
          processedLearningInterests = learningInterests;
        } else if (typeof learningInterests === "string") {
          // If it's a string, convert to array
          processedLearningInterests = [learningInterests];
        }
      }

      const user = await User.create({
        name,
        email,
        password,
        learningInterests: processedLearningInterests,
      });

      const cleanUser = user.toJSON();
      delete cleanUser.password;

      res.status(201).json({
        message: "User registered successfully",
        user: cleanUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email) {
        throw { name: "Bad Request", message: "Email is required" };
      }

      if (!password) {
        throw { name: "Bad Request", message: "Password is required" };
      }

      const user = await User.findOne({
        where: {
          email,
        },
      });

      if (!user) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const isPasswordMatch = comparePassword(password, user.password);

      if (!isPasswordMatch) {
        throw { name: "Unauthorized", message: "Invalid email/password" };
      }

      const access_token = signToken({ id: user.id });

      const cleanUser = user.toJSON();
      delete cleanUser.password;
      delete cleanUser.createdAt;
      delete cleanUser.updatedAt;

      res.status(200).json({
        message: "Login successful",
        access_token,
        user: cleanUser,
      });
    } catch (error) {
      next(error);
    }
  }

  static async updateInterests(req, res, next) {
    try {
      const { learningInterests } = req.body;

      // Handle learningInterests properly - convert string to array if needed
      let processedLearningInterests = [];
      if (learningInterests) {
        if (Array.isArray(learningInterests)) {
          processedLearningInterests = learningInterests;
        } else if (typeof learningInterests === "string") {
          // If it's a string, convert to array
          processedLearningInterests = [learningInterests];
        }
      }

      const user = await User.findByPk(req.user.id);
      if (!user) {
        throw { name: "Not Found", message: "User not found" };
      }

      user.learningInterests = processedLearningInterests;
      await user.save();

      res.json({
        message: "Learning interests updated successfully",
        learningInterests: user.learningInterests,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getProfile(req, res, next) {
    try {
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ["password"] },
      });

      if (!user) {
        throw { name: "Not Found", message: "User not found" };
      }

      res.json({ user });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = AuthController;
