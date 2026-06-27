const express = require("express");
const router = express.Router();

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
router.post("/", createMenuItem);

// Update menu item
router.put("/:id", updateMenuItem);

// Delete menu item
router.delete("/:id", deleteMenuItem);

module.exports = router;
