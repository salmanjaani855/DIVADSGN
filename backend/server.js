// Must be the first import: ES modules fully evaluate all imports (including
// config/stripe.js and config/cloudinary.js, which read process.env at load
// time) before any other top-level code in this file runs. Loading dotenv's
// side effects via this import form -- instead of a later dotenv.config()
// call -- guarantees env vars are populated before those configs are read.
import "dotenv/config";

import express from "express";
import cors from "cors";

import connectDB from "./config/db.js";
import { stripeWebhook } from "./controllers/subscriptionController.js";

import authRoutes from "./routes/authRoutes.js";
import blogRoutes from "./routes/blogRoutes.js";
import planRoutes from "./routes/planRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";

const app = express();

connectDB();

// CLIENT_URL may hold a comma-separated list, since Vite auto-shifts ports
// (5173 -> 5174 -> ...) when the default one is already in use.
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS blocked for origin: ${origin}`));
      }
    },
    credentials: true,
  })
);

// Stripe webhook needs the raw request body to verify the signature, so it
// must be mounted BEFORE the global express.json() parser below.
app.post("/api/subscription/webhook", express.raw({ type: "application/json" }), stripeWebhook);

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.use("/api/auth", authRoutes);
app.use("/api/blogs", blogRoutes);
app.use("/api/plans", planRoutes);
app.use("/api/subscription", subscriptionRoutes);
app.use("/api/admin", adminRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Centralized error handler -- logs full error server-side but only ever
// sends a safe { message } payload to the client (no stack traces leaked).
app.use((err, req, res, next) => {
  console.error("[error]", err);
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal server error";
  res.status(status).json({ message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`[server] Listening on http://localhost:${PORT}`);
});
