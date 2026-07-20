const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
  updateOrderPayment,
  getAvailableOrders,
  assignCourier,
} = require("../controllers/orderController");

// ===============================
// Protected Routes
// ===============================

// Create Order
router.post("/", auth, authorize("customer", "admin"), createOrder);
router.post("/create", auth, authorize("customer", "admin"), createOrder);

// Get Logged-in User Orders
router.get("/", auth, getMyOrders);

// Available Orders for Couriers (must be before /:id)
router.get("/available", auth, authorize("courier"), getAvailableOrders);

// Get Single Order
router.get("/:id", auth, getOrderById);

// Assign Courier to Order (claim)
router.put("/:id/assign", auth, authorize("courier"), assignCourier);

// Update Order Status
router.put("/:id/status", auth, authorize("restaurant", "courier", "admin"), updateOrderStatus);

// Cancel Order
router.put("/:id/cancel", auth, cancelOrder);

// Update Order Payment Status (reconciliation)
router.put("/:id/payment", auth, updateOrderPayment);

module.exports = router;
