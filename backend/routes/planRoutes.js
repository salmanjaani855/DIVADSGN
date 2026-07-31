import express from "express";
import Plan from "../models/Plan.js";

const router = express.Router();

router.get("/", async (req, res, next) => {
  try {
    const plans = await Plan.find().select("-stripePriceId");
    res.status(200).json(plans);
  } catch (err) {
    next(err);
  }
});

export default router;
