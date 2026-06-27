const Reservation = require("../models/Reservation");

// ======================================
// Create Reservation
// ======================================
const createReservation = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      restaurantId,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequest,
    } = req.body;

    const reservation = await Reservation.create({
      userId,
      restaurantId,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequest,
    });

    res.status(201).json({
      success: true,
      message: "Reservation created successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get My Reservations
// ======================================
const getMyReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      userId: req.user.id,
    })
      .populate("restaurantId", "name address")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Reservation By ID
// ======================================
const getReservationById = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id)
      .populate("restaurantId")
      .populate("userId", "name email");

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    res.status(200).json({
      success: true,
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Get Reservations By Restaurant
// ======================================
const getRestaurantReservations = async (req, res) => {
  try {
    const reservations = await Reservation.find({
      restaurantId: req.params.restaurantId,
    })
      .populate("userId", "name email")
      .sort({ reservationDate: 1 });

    res.status(200).json({
      success: true,
      count: reservations.length,
      reservations,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Reservation
// ======================================
const updateReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    reservation.reservationDate =
      req.body.reservationDate || reservation.reservationDate;

    reservation.reservationTime =
      req.body.reservationTime || reservation.reservationTime;

    reservation.numberOfGuests =
      req.body.numberOfGuests || reservation.numberOfGuests;

    reservation.specialRequest =
      req.body.specialRequest || reservation.specialRequest;

    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation updated successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Reservation Status
// ======================================
const updateReservationStatus = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    reservation.status = req.body.status;

    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation status updated successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Cancel Reservation
// ======================================
const cancelReservation = async (req, res) => {
  try {
    const reservation = await Reservation.findById(req.params.id);

    if (!reservation) {
      return res.status(404).json({
        success: false,
        message: "Reservation not found",
      });
    }

    reservation.status = "Cancelled";

    await reservation.save();

    res.status(200).json({
      success: true,
      message: "Reservation cancelled successfully",
      reservation,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  createReservation,
  getMyReservations,
  getReservationById,
  getRestaurantReservations,
  updateReservation,
  updateReservationStatus,
  cancelReservation,
};