const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const auth = require("../middleware/auth");

// Public Routes
router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);

// Create route is public for easy API testing.
router.post("/", createRestaurant);

// Protected Routes
router.put("/:id", auth, updateRestaurant);
router.delete("/:id", auth, deleteRestaurant);

module.exports = router;
