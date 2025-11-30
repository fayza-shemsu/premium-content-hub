import express from "express";
import {
  createPaymentIntent,
  createSubscription,
  webhookHandler,
} from "../controllers/paymentController.js";
const router = express.Router();

router.post("/create-payment-intent", createPaymentIntent);
router.post("/create-subscription", createSubscription);
router.post("/webhook", webhookHandler);

export default router;
