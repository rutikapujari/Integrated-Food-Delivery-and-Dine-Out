const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");

const {
  createReservation,
  getMyReservations,
  getReservationById,
  getRestaurantReservations,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
} = require("../controllers/reservation_controller");

// ================================
// Protected Routes
// ================================

// Create Reservation
router.post("/", auth, createReservation);

// Get Logged-in User Reservations
router.get("/", auth, getMyReservations);

// Get Reservations of a Restaurant
router.get("/restaurant/:restaurantId", auth, getRestaurantReservations);

// Get Reservation By ID
router.get("/:id", auth, getReservationById);

// Update Reservation Details
router.put("/:id", auth, updateReservation);

// Update Reservation Status
router.put("/:id/status", auth, updateReservationStatus);

// Cancel Reservation
router.put("/:id/cancel", auth, cancelReservation);

module.exports = router;
