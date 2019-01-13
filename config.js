exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost:27017/mongooseblogdb";
exports.PORT = process.env.PORT || 8080;