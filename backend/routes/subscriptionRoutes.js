import express from "express";
import {
  createCheckoutSession,
  getSubscriptionMe,
  cancelSubscription,
  createPortalSession,
} from "../controllers/subscriptionController.js";
import { authMiddleware } from "../middleware/authMiddleware.js";

// NOTE: the raw-body webhook route (`POST /api/subscription/webhook`) is
// intentionally NOT defined here -- it is mounted directly in server.js
// with `express.raw()` BEFORE the global `express.json()` middleware, since
// Stripe signature verification requires the untouched raw request body.

const router = express.Router();

router.post("/create-checkout-session", authMiddleware, createCheckoutSession);
router.get("/me", authMiddleware, getSubscriptionMe);
router.post("/cancel", authMiddleware, cancelSubscription);
router.post("/portal", authMiddleware, createPortalSession);

export default router;
