import mongoose from "mongoose";

/**
 * Connects to MongoDB using MONGO_URI. Failure to connect (e.g. Mongo not
 * running locally yet) is logged clearly but does NOT crash the process --
 * the rest of the API (health check, static routes, etc.) should still be
 * reachable while the DB is unavailable, and mongoose will keep retrying
 * in the background based on its own reconnection logic.
 */
const connectDB = async () => {
  const uri = process.env.MONGO_URI || "mongodb://localhost:27017/blogsaas";

  mongoose.connection.on("connected", () => {
    console.log(`[db] MongoDB connected -> ${mongoose.connection.host}/${mongoose.connection.name}`);
  });

  mongoose.connection.on("error", (err) => {
    console.error(`[db] MongoDB connection error: ${err.message}`);
  });

  mongoose.connection.on("disconnected", () => {
    console.warn("[db] MongoDB disconnected");
  });

  try {
    await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 5000,
    });
  } catch (err) {
    console.error(
      `[db] Initial MongoDB connection failed: ${err.message}\n` +
        "[db] The server will continue running so non-DB routes stay reachable. " +
        "Start MongoDB and restart the server (or wait for mongoose to retry) once it's available."
    );
  }
};

export default connectDB;
