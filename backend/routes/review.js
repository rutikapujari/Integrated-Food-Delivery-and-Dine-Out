const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

const {
  createReview,
  getReviews,
  getReviewById,
  getRestaurantReviews,
  getMyReviews,
  updateReview,
  deleteReview,
} = require("../controllers/review_controller");

// ===============================
// Protected Routes
// ===============================

// Create Review
router.post("/", auth, authorize("customer", "admin"), createReview);

// Get All Reviews
router.get("/", getReviews);

// Get Reviews of a Restaurant
router.get("/restaurant/:restaurantId", getRestaurantReviews);

// Get Current User's Reviews
router.get("/my", auth, getMyReviews);

// Get Review By ID
router.get("/:id", getReviewById);

// Update Review
router.put("/:id", auth, updateReview);

// Delete Review
router.delete("/:id", auth, authorize("customer", "admin"), deleteReview);

module.exports = router;
