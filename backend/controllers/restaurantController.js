const Restaurant = require("../models/Restaurant");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const normalizeCuisine = (cuisine) => {
  if (Array.isArray(cuisine)) {
    const normalizedCuisine = cuisine
      .map((item) => String(item).trim())
      .filter(Boolean)
      .join(", ");

    return normalizedCuisine || "General";
  }

  return String(cuisine || "").trim() || "General";
};

const normalizeAddress = (address) => {
  if (!address || typeof address !== "object" || Array.isArray(address)) {
    return address;
  }

  return [
    address.street,
    address.city,
    address.state,
    address.zipCode || address.pincode,
    address.country,
  ]
    .map((part) => String(part || "").trim())
    .filter(Boolean)
    .join(", ");
};

const normalizeCoordinates = (body, fallbackCoordinates = [0, 0]) => {
  const coordinates = body.coordinates || body.location?.coordinates;

  if (Array.isArray(coordinates)) {
    const normalizedCoordinates = coordinates.map(Number);

    return normalizedCoordinates.every(Number.isFinite)
      ? normalizedCoordinates
      : fallbackCoordinates;
  }

  if (coordinates && typeof coordinates === "object") {
    const longitude = toNumber(coordinates.lng ?? coordinates.longitude);
    const latitude = toNumber(coordinates.lat ?? coordinates.latitude);

    if (longitude !== null && latitude !== null) {
      return [longitude, latitude];
    }
  }

  const longitude = toNumber(
    body.lng ?? body.longitude ?? body.location?.lng ?? body.location?.longitude
  );
  const latitude = toNumber(
    body.lat ?? body.latitude ?? body.location?.lat ?? body.location?.latitude
  );

  if (longitude !== null && latitude !== null) {
    return [longitude, latitude];
  }

  return fallbackCoordinates;
};

const buildRestaurantPayload = (body) => ({
  ...body,
  cuisine: normalizeCuisine(body.cuisine),
  address: normalizeAddress(body.address),
  location: {
    type: "Point",
    coordinates: normalizeCoordinates(body),
  },
});

const buildRestaurantUpdatePayload = (body) => {
  const payload = { ...body };

  if (body.cuisine !== undefined) {
    payload.cuisine = normalizeCuisine(body.cuisine);
  }

  if (body.address !== undefined) {
    payload.address = normalizeAddress(body.address);
  }

  if (body.coordinates !== undefined || body.location?.coordinates !== undefined) {
    payload.location = {
      type: "Point",
      coordinates: normalizeCoordinates(body, undefined),
    };
    delete payload.coordinates;
  }

  return payload;
};

const sendControllerError = (res, error) => {
  const statusCode = error.name === "ValidationError" ? 400 : 500;

  return res.status(statusCode).json({
    success: false,
    message: error.message,
  });
};

// ==============================
// Create Restaurant
// ==============================
const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({
      ...buildRestaurantPayload(req.body),
      ownerId: req.user?._id || req.body.ownerId,
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// ==============================
// Get All Restaurants
// ==============================
const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({
      createdAt: -1,
    });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// ==============================
// Get Nearby Restaurants With $geoNear
// ==============================
const getNearbyRestaurants = async (req, res) => {
  try {
    const longitude = toNumber(req.query.lng || req.query.longitude);
    const latitude = toNumber(req.query.lat || req.query.latitude);
    const maxDistanceKm = toNumber(req.query.maxDistanceKm) || 10;
    const limit = Math.min(toNumber(req.query.limit) || 20, 100);
    const cuisine = req.query.cuisine;

    if (longitude === null || latitude === null) {
      return res.status(400).json({
        success: false,
        message: "lat and lng query params are required",
      });
    }

    const query = {
      status: "approved",
      isOpen: true,
    };

    if (cuisine) {
      query.cuisine = new RegExp(cuisine, "i");
    }

    const restaurants = await Restaurant.aggregate([
      {
        $geoNear: {
          near: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          distanceField: "distanceMeters",
          maxDistance: maxDistanceKm * 1000,
          spherical: true,
          query,
        },
      },
      {
        $addFields: {
          distanceKm: {
            $round: [{ $divide: ["$distanceMeters", 1000] }, 2],
          },
        },
      },
      { $sort: { distanceMeters: 1, rating: -1 } },
      { $limit: limit },
    ]);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// ==============================
// Get Restaurant By ID
// ==============================
const getRestaurantById = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    res.status(200).json({
      success: true,
      restaurant,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// ==============================
// Update Restaurant
// ==============================
const updateRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (
      req.user?.role !== "admin" &&
      restaurant.ownerId?.toString() !== req.user?._id?.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own restaurant",
      });
    }

    const updatedRestaurant = await Restaurant.findByIdAndUpdate(
      req.params.id,
      buildRestaurantUpdatePayload(req.body),
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "Restaurant updated successfully",
      restaurant: updatedRestaurant,
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

// ==============================
// Delete Restaurant
// ==============================
const deleteRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    await Restaurant.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Restaurant deleted successfully",
    });
  } catch (error) {
    sendControllerError(res, error);
  }
};

module.exports = {
  createRestaurant,
  getRestaurants,
  getNearbyRestaurants,
  getRestaurantById,
  updateRestaurant,
  deleteRestaurant,
};
