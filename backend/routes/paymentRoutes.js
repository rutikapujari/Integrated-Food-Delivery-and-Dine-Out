const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createCheckoutSession,
  verifyPayment,
  stripeWebhook,
} = require("../controllers/paymentController");

// ==============================
// Protected Routes
// ==============================

// Create Stripe Checkout Session
router.post("/checkout", auth, createCheckoutSession);

// Verify Payment
router.post("/verify", auth, verifyPayment);

// Stripe webhook endpoint
router.post("/webhook", stripeWebhook);

module.exports = router;
