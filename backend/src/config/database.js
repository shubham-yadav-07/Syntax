const mongoose = require("mongoose");
const logger = require("../utils/logger");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    logger.info("MongoDB connected: " + conn.connection.host);
    mongoose.connection.on("error", (e) => logger.error("MongoDB error: " + e));
    mongoose.connection.on("disconnected", () => logger.warn("MongoDB disconnected"));
  } catch (e) {
    logger.error("MongoDB connection failed: " + e.message);
    process.exit(1);
  }
};
module.exports = connectDB;
