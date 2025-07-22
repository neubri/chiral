const express = require("express");
const AuthController = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authentication");

const router = express.Router();

// Public routes
router.post("/register", AuthController.register);
router.post("/login", AuthController.login);

// Protected routes
router.use(authenticateToken);
router.put("/interests", AuthController.updateInterests);
router.get("/profile", AuthController.getProfile);

module.exports = router;
