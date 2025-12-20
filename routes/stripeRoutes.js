<<<<<<< HEAD
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
=======
const express = require('express');
const { createCheckoutSession, webhook } = require('../controllers/stripeController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
>>>>>>> 55e7c2daa198ec1d0499a120b7112bdc42283680
