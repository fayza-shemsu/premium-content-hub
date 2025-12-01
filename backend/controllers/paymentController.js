import Stripe from "stripe";
import dotenv from "dotenv";
dotenv.config();

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// -----------------------------------
// One-time payment
// -----------------------------------
export const createPaymentIntent = async (req, res) => {
  try {
    const { amount } = req.body; // amount in cents
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: "usd",
    });
    res.send({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// -----------------------------------
// Subscription payment
// -----------------------------------
export const createSubscription = async (req, res) => {
  try {
    const { customerId, priceId } = req.body;
    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId }],
      payment_behavior: "default_incomplete",
      expand: ["latest_invoice.payment_intent"],
    });
    res.send(subscription);
  } catch (err) {
    res.status(500).send({ error: err.message });
  }
};

// -----------------------------------
// Webhook handler
// -----------------------------------
export const webhookHandler = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  let event;

  try {
    // req.body must be raw (handled in server.js)
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    console.log("🔔 Webhook received!");
    console.log(`✅ Event type: ${event.type}`);

    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object;
      console.log("💰 Payment succeeded!", paymentIntent.id);
      // TODO: update DB
    }

    if (event.type === "invoice.payment_succeeded") {
      const invoice = event.data.object;
      console.log("💳 Subscription payment succeeded!", invoice.id);
      // TODO: update DB
    }

    res.json({ received: true });
  } catch (err) {
    console.error(`❌ Webhook error: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
