const Event = require("../models/Event");
const Restaurant = require("../models/Restaurant");
const mongoose = require("mongoose");

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// ======================================
// Get Published Events (with optional filters)
// ======================================
const getEvents = async (req, res) => {
  try {
    const { search, category, upcoming, page = 1, limit = 12 } = req.query;
    const filter = { status: "published" };

    if (search) {
      const safeSearch = escapeRegex(search);
      filter.$or = [
        { title: { $regex: safeSearch, $options: "i" } },
        { description: { $regex: safeSearch, $options: "i" } },
        { tags: { $in: [search] } },
      ];
    }
    if (category && category !== "all") filter.category = category;
    if (upcoming === "true" || upcoming === "1") {
      filter.startDate = { $gte: new Date() };
    }

    const events = await Event.find(filter)
      .populate("restaurantId", "name image")
      .sort({ startDate: 1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    const total = await Event.countDocuments(filter);

    res.status(200).json({
      success: true,
      count: events.length,
      total,
      events,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Single Event
// ======================================
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id)
      .populate("restaurantId", "name image address phone")
      .populate("createdBy", "name");

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    res.status(200).json({ success: true, event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Get Nearby Events
// ======================================
const getNearbyEvents = async (req, res) => {
  try {
    const { lng, lat, maxDistance = 10000 } = req.query;
    if (!lng || !lat) {
      return res.status(400).json({ success: false, message: "lng and lat are required" });
    }

    const events = await Event.find({
      status: "published",
      startDate: { $gte: new Date() },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [Number(lng), Number(lat)] },
          $maxDistance: Number(maxDistance),
        },
      },
    })
      .populate("restaurantId", "name image")
      .sort({ startDate: 1 });

    res.status(200).json({ success: true, count: events.length, events });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Create Event (restaurant partner or admin)
// ======================================
const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      restaurantId,
      category,
      image,
      venue,
      address,
      location,
      startDate,
      endDate,
      price,
      capacity,
      tags,
    } = req.body;

    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: "Title, start date and end date are required",
      });
    }

    let resolvedLocation = location;
    if (restaurantId && !resolvedLocation) {
      const restaurant = await Restaurant.findById(restaurantId).select("location address");
      if (restaurant) {
        resolvedLocation = restaurant.location;
        if (!address) address = restaurant.address;
      }
    }

    const event = await Event.create({
      title,
      description,
      restaurantId,
      category: category || "other",
      image,
      venue,
      address,
      location: resolvedLocation || { type: "Point", coordinates: [0, 0] },
      startDate,
      endDate,
      price: price || 0,
      capacity: capacity || 0,
      tags: tags || [],
      status: "published",
      createdBy: req.user.id,
    });

    res.status(201).json({ success: true, message: "Event created", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Update Event
// ======================================
const updateEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const updatable = [
      "title", "description", "category", "image", "venue",
      "address", "location", "startDate", "endDate", "price",
      "capacity", "tags", "status",
    ];
    updatable.forEach((key) => {
      if (req.body[key] !== undefined) event[key] = req.body[key];
    });

    await event.save();
    res.status(200).json({ success: true, message: "Event updated", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Delete Event
// ======================================
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    await event.deleteOne();
    res.status(200).json({ success: true, message: "Event deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// RSVP / Book a spot
// ======================================
const rsvpEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }
    if (event.status !== "published") {
      return res.status(400).json({ success: false, message: "Event is not open for booking" });
    }
    if (event.capacity && event.bookedCount >= event.capacity) {
      return res.status(400).json({ success: false, message: "Event is fully booked" });
    }

    if (event.attendees && event.attendees.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: "You have already RSVP'd to this event" });
    }

    event.bookedCount += 1;
    if (!event.attendees) event.attendees = [];
    event.attendees.push(req.user.id);
    await event.save();

    res.status(200).json({ success: true, message: "RSVP confirmed", event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getEvents,
  getEventById,
  getNearbyEvents,
  createEvent,
  updateEvent,
  deleteEvent,
  rsvpEvent,
};
