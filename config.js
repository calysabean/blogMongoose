exports.DATABASE_URL =
  process.env.DATABASE_URL || "mongodb://localhost/Blog-post";
exports.TEST_DATABASE_URL =
  process.env.TEST_DATABASE_URL || "mongodb://localhost/test-Blog-post";
exports.PORT = process.env.PORT || 8080;