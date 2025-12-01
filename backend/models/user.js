import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    stripeCustomerId: { type: String },
    subscriptionStatus: { type: String, default: "inactive" },
    oneTimePurchases: [{ type: String }], // store product IDs
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
