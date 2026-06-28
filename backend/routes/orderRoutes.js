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
} = require("../controllers/orderController");

// ===============================
// Protected Routes
// ===============================

// Create Order
router.post("/create", auth, authorize("customer", "admin"), createOrder);

// Get Logged-in User Orders
router.get("/", auth, getMyOrders);

// Get Single Order
router.get("/:id", auth, getOrderById);

// Update Order Status
router.put("/:id/status", auth, authorize("restaurant", "courier", "admin"), updateOrderStatus);

// Cancel Order
router.put("/:id/cancel", auth, cancelOrder);

module.exports = router;
