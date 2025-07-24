// Jest setup file for API testing
const { sequelize } = require("../models");

// Set required environment variables for testing
process.env.JWT_SECRET =
  process.env.JWT_SECRET || "super-secret-test-key-for-jwt-token-signing";
process.env.NODE_ENV = "test";

// Increase timeout for database operations
jest.setTimeout(30000);

// Setup database connection before all tests
beforeAll(async () => {
  try {
    await sequelize.authenticate();
    console.log("Database connection established for testing.");

    // Sync models (create tables if they don't exist)
    await sequelize.sync({ force: false });
  } catch (error) {
    console.error("Unable to connect to the database:", error);
    throw error;
  }
});

// Close database connection after all tests
afterAll(async () => {
  try {
    await sequelize.close();
    console.log("Database connection closed.");
  } catch (error) {
    console.error("Error closing database connection:", error);
  }
});

// Global error handler for unhandled promises
process.on("unhandledRejection", (reason, promise) => {
  console.error("Unhandled Rejection at:", promise, "reason:", reason);
});

// Mock console.log and console.error to reduce noise during tests
const originalConsoleLog = console.log;
const originalConsoleError = console.error;

beforeEach(() => {
  console.log = jest.fn();
  console.error = jest.fn();
});

afterEach(() => {
  console.log = originalConsoleLog;
  console.error = originalConsoleError;
});
