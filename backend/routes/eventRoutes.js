const express = require("express");
const router = express.Router();

const {
  getEvents,
  getEventById,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
} = require("../controllers/eventController");

const auth = require("../middleware/auth");
const authorize = require("../middleware/role");

// Public
router.get("/", getEvents);
router.get("/nearby", getNearbyEvents);
router.get("/:id", getEventById);

// Protected (restaurant partner / admin)
router.post("/", auth, authorize("restaurant", "admin"), createEvent);
router.put("/:id", auth, authorize("restaurant", "admin"), updateEvent);
router.delete("/:id", auth, authorize("restaurant", "admin"), deleteEvent);
router.post("/:id/rsvp", auth, rsvpEvent);

module.exports = router;
