const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  createCheckoutSession,
  verifyPayment,
  stripeWebhook,
} = require("../controllers/paymentController");

// ==============================
// Protected Routes
// ==============================

// Get payments
router.get("/", auth, getPayments);

// Create manual payment record
router.post("/", auth, createPayment);

// Create Stripe Checkout Session
router.post("/checkout", auth, createCheckoutSession);

// Verify Payment
router.post("/verify", auth, verifyPayment);

// Stripe webhook endpoint
router.post("/webhook", stripeWebhook);

// Update payment
router.put("/:id", auth, updatePayment);

// Delete payment
router.delete("/:id", auth, deletePayment);

module.exports = router;
