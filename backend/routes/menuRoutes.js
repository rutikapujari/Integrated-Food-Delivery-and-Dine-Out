const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

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

// Create menu item (auth required, ownership checked in controller)
router.post("/", auth, createMenuItem);

// Update menu item (auth required, ownership checked in controller)
router.put("/:id", auth, updateMenuItem);

// Delete menu item (auth required, ownership checked in controller)
router.delete("/:id", auth, deleteMenuItem);

module.exports = router;
