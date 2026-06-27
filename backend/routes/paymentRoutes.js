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

// Stripe Webhook
// IMPORTANT: This route must use express.raw()
router.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

module.exports = router;