const { comparePassword } = require("../helpers/bcrypt");
const { signToken } = require("../helpers/jwt");
const { User } = require("../models");
const googleAuthHelper = require("../helpers/googleAuth");

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

  static async googleLogin(req, res, next) {
    try {
      const { googleToken } = req.body;

      if (!googleToken) {
        throw { name: "Bad Request", message: "Google token is required" };
      }

      // Verify Google ID token
      const googleUserData = await googleAuthHelper.verifyIdToken(googleToken);

      // Check if user already exists
      let user = await User.findOne({
        where: {
          email: googleUserData.email,
        },
      });

      if (!user) {
        // Create new user if doesn't exist
        user = await User.create({
          name: googleUserData.name,
          email: googleUserData.email,
          googleId: googleUserData.googleId,
          profilePicture: googleUserData.picture,
          password: "google_oauth_user", // Placeholder password for Google users
        });
      } else {
        // Update existing user with Google data if not already set
        if (!user.googleId) {
          user.googleId = googleUserData.googleId;
          user.profilePicture = googleUserData.picture || user.profilePicture;
          await user.save();
        }
      }

      // Generate JWT token
      const access_token = signToken({ id: user.id });

      // Clean user data for response
      const cleanUser = user.toJSON();
      delete cleanUser.password;

      res.status(200).json({
        message: "Google login successful",
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
