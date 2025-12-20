const express = require('express');
const { createCheckoutSession, webhook } = require('../controllers/stripeController');
const verifyToken = require('../middleware/verifyToken');

const router = express.Router();

router.post('/create-checkout-session', verifyToken, createCheckoutSession);
router.post('/webhook', express.raw({ type: 'application/json' }), webhook);

module.exports = router;
