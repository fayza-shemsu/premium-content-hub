import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import Stripe from "stripe";
import paymentRoutes from "./routes/payment.js";

dotenv.config();

const app = express();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY); // Stripe initialized

app.use(cors());

// --------------------------------------------------
// 1️⃣ Stripe Webhook Route (must be RAW body)
// --------------------------------------------------
app.post(
  "/webhook",
  bodyParser.raw({ type: "application/json" }),
  async (req, res) => {
    console.log("🔔 Webhook received!");

    const sig = req.headers["stripe-signature"];

    try {
      const event = stripe.webhooks.constructEvent(
        req.body,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );

      console.log(`✅ Event type: ${event.type}`);

      if (event.type === "payment_intent.succeeded") {
        console.log("💰 Payment succeeded!");
      }

      res.json({ received: true });
    } catch (err) {
      console.error(`❌ Webhook error: ${err.message}`);
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
);

// --------------------------------------------------
// 2️⃣ Normal API Routes (must come AFTER webhook)
// --------------------------------------------------
app.use(express.json());
app.use("/api/payment", paymentRoutes);

// --------------------------------------------------
// 3️⃣ Start Server
// --------------------------------------------------
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
