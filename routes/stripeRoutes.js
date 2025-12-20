// backend/routes/stripeRoutes.js

const express = require("express");
const {
  createCheckoutSession,
  webhookHandler,
} = require("../controllers/stripeController");

const router = express.Router();

// Checkout session create (normal json body)
router.post("/create-checkout-session", createCheckoutSession);

// Webhook (raw body needed for Stripe signature)
router.post("/webhook", express.raw({ type: "application/json" }), webhookHandler);

module.exports = router;