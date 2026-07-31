import mongoose from "mongoose";

const planSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, default: 0 },
  stripePriceId: { type: String, default: "" },
  features: { type: [String], default: [] },
  accessLevel: {
    type: String,
    enum: ["free", "pro", "premium"],
    required: true,
  },
});

const Plan = mongoose.model("Plan", planSchema);

export default Plan;
