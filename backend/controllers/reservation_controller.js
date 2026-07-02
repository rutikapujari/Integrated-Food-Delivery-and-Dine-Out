const Reservation = require("../models/Reservation");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const { sendNotificationEmail } = require("../services/notificationService");

const sendReservationEmail = async (reservation, subject, message) => {
  const user = await User.findById(reservation.userId).select("name email");
  const restaurant = await Restaurant.findById(reservation.restaurantId).select("name");

  if (!user?.email) return;

  await sendNotificationEmail(
    user.email,
    subject,
    `
      <h2>${subject}</h2>
      <p>Hello ${user.name || "Customer"},</p>
      <p>${message}</p>
      <p><strong>Restaurant:</strong> ${restaurant?.name || reservation.restaurantId}</p>
      <p><strong>Date:</strong> ${reservation.reservationDate}</p>
      <p><strong>Time:</strong> ${reservation.reservationTime}</p>
      <p><strong>Status:</strong> ${reservation.status}</p>
    `
  );
};

const normalizeReservationPayload = (body) => ({
  restaurantId: body.restaurantId || body.restaurant,
  reservationDate: body.reservationDate || body.date || body.reservation_date,
  reservationTime: body.reservationTime || body.time || body.reservation_time,
  numberOfGuests:
    body.numberOfGuests || body.guests || body.partySize || body.party_size,
  specialRequest:
    body.specialRequest || body.specialRequests || body.special_request || "",
});

const validateReservationPayload = ({
  restaurantId,
  reservationDate,
  reservationTime,
  numberOfGuests,
}) => {
  const missingFields = [];

  if (!restaurantId) missingFields.push("restaurantId");
  if (!reservationDate) missingFields.push("reservationDate");
  if (!reservationTime) missingFields.push("reservationTime");
  if (!numberOfGuests) missingFields.push("numberOfGuests");

  return missingFields;
};

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
    } = normalizeReservationPayload(req.body);

    const missingFields = validateReservationPayload({
      restaurantId,
      reservationDate,
      reservationTime,
      numberOfGuests,
    });

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required reservation fields: ${missingFields.join(", ")}`,
      });
    }

    const reservation = await Reservation.create({
      userId,
      restaurantId,
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequest,
    });

    await sendReservationEmail(
      reservation,
      "Reservation Created",
      "Your table reservation has been created successfully."
    );

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

    const {
      reservationDate,
      reservationTime,
      numberOfGuests,
      specialRequest,
    } = normalizeReservationPayload(req.body);

    reservation.reservationDate =
      reservationDate || reservation.reservationDate;

    reservation.reservationTime =
      reservationTime || reservation.reservationTime;

    reservation.numberOfGuests =
      numberOfGuests || reservation.numberOfGuests;

    reservation.specialRequest =
      specialRequest || reservation.specialRequest;

    await reservation.save();
    await sendReservationEmail(
      reservation,
      "Reservation Updated",
      "Your reservation details have been updated."
    );

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
    await sendReservationEmail(
      reservation,
      "Reservation Status Updated",
      `Your reservation status was updated to ${reservation.status}.`
    );

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
    await sendReservationEmail(
      reservation,
      "Reservation Cancelled",
      "Your reservation has been cancelled."
    );

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
