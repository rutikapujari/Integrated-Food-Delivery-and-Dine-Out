const express = require("express");
const router = express.Router();

const {
  createRestaurant,
  getRestaurants,
  getNearbyRestaurants,
  getRestaurantById,
  getRestaurantAnalytics,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
} = require("../controllers/restaurantController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

// Public Routes
router.get("/", getRestaurants);
router.get("/nearby", getNearbyRestaurants);
router.get("/mine", auth, authorize("restaurant", "admin"), getMyRestaurant);
router.get("/:id/analytics", auth, authorize("restaurant", "admin"), getRestaurantAnalytics);
router.get("/:id", getRestaurantById);

router.post("/", auth, authorize("restaurant", "admin"), createRestaurant);

// Protected Routes
router.put("/:id", auth, authorize("restaurant", "admin"), updateRestaurant);
router.delete("/:id", auth, authorize("admin"), deleteRestaurant);

module.exports = router;
