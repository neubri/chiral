function errorHandler(error, req, res, next) {
  switch (error.name) {
    case "SequelizeValidationError":
    case "SequelizeUniqueConstraintError":
      res.status(400).json({ message: error.errors[0].message });
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

    default:
      res.status(500).json({ message: "Internal server error" });
      break;
  }
}

module.exports = errorHandler;
