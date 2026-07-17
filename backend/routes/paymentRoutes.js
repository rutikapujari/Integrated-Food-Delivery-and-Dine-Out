const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
  markCodPaid,
  generateUpiQr,
  confirmUpiPayment,
} = require("../controllers/paymentController");

// ==============================
// Webhook (no auth, raw body)
// ==============================
router.post("/webhook", razorpayWebhook);

// ==============================
// Protected Routes
// ==============================

// Get payments
router.get("/", auth, getPayments);

// Create manual payment record
router.post("/", auth, createPayment);

// Create Razorpay Order
router.post("/create-order", auth, createRazorpayOrder);

// Verify Razorpay Payment
router.post("/verify", auth, verifyRazorpayPayment);

// Mark Cash on Delivery as Paid
router.post("/cod-paid", auth, markCodPaid);

// Generate UPI QR code for scanning
router.post("/upi-qr", auth, generateUpiQr);

// Confirm UPI payment after scanning QR
router.post("/upi-confirm", auth, confirmUpiPayment);

// Update payment
router.put("/:id", auth, updatePayment);

// Delete payment
router.delete("/:id", auth, deletePayment);

module.exports = router;
