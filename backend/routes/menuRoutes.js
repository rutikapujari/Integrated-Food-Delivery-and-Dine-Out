const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  createMenuItem,
  getMenuItems,
  getMenuByRestaurant,
  getMenuItemById,
  updateMenuItem,
  deleteMenuItem,
} = require("../controllers/menuController");

// =============================
// Public Routes
// =============================

// Get all menu items
router.get("/", getMenuItems);

// Get menu items by restaurant
router.get("/restaurant/:restaurantId", getMenuByRestaurant);

// Get single menu item
router.get("/:id", getMenuItemById);

// Create menu item
router.post("/", auth, authorize("restaurant", "admin"), createMenuItem);

// Update menu item
router.put("/:id", auth, authorize("restaurant", "admin"), updateMenuItem);

// Delete menu item
router.delete("/:id", auth, authorize("restaurant", "admin"), deleteMenuItem);

module.exports = router;
