const Restaurant = require("../models/Restaurant");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const buildRestaurantUpdatePayload = (body) => {
  const payload = { ...body };

  if (Array.isArray(body.coordinates)) {
    payload.location = {
      type: "Point",
      coordinates: body.coordinates.map(Number),
    };
    delete payload.coordinates;
  }

  return payload;
};

// ==============================
// Create Restaurant
// ==============================
const createRestaurant = async (req, res) => {
  try {
    const {
      name,
      cuisine,
      description,
      address,
      phone,
      email,
      image,
      openHours,
      isOpen,
      coordinates,
      ownerId,
    } = req.body;

    const restaurant = await Restaurant.create({
      name,
      ownerId: req.user?.id || ownerId,
      cuisine,
      description,
      address,
      phone,
      email,
      image,
      openHours,
      isOpen,
      location: {
        type: "Point",
        coordinates,
      },
    });

    res.status(201).json({
      success: true,
      message: "Restaurant created successfully",
      restaurant,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
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
