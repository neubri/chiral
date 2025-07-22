function errorHandler(error, req, res, next) {
  // Log error for debugging (only in development)
  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", error);
  }

  switch (error.name) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: error.errors[0].message });
      break;
    case "SequelizeDatabaseError":
      res.status(500).json({ message: "Database error occurred" });
      break;
    case "SequelizeConnectionError":
      res.status(503).json({ message: "Database connection failed" });
      break;
    case "Bad Request":
      res.status(400).json({ message: error.message });
      break;
    case "Not Found":
      res.status(404).json({ message: error.message });
      break;
    case "Unauthorized":
      res.status(401).json({ message: error.message });
      break;
    case "Forbidden":
      res.status(403).json({ message: error.message });
      break;
    case "JsonWebTokenError":
      res.status(401).json({ message: "Invalid token" });
      break;
    case "TokenExpiredError":
      res.status(401).json({ message: "Token expired" });
      break;
    case "PayloadTooLargeError":
      res.status(413).json({ message: "Request payload too large" });
      break;
    case "Service Unavailable":
      res.status(503).json({ message: error.message });
      break;

    default:
      // Don't expose internal error details in production
      const message =
        process.env.NODE_ENV === "production"
          ? "Internal server error"
          : error.message || "Internal server error";
      res.status(500).json({ message });
      break;
  }
}

module.exports = errorHandler;
