const mongoose = require("mongoose");
const Restaurant = require("../models/Restaurant");
const Order = require("../models/Order");
const Review = require("../models/Review");
const MenuItem = require("../models/MenuItem");

const toNumber = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
};

const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

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

const firstText = (...values) => {
  for (const value of values) {
    const normalizedValue = String(value || "").trim();

    if (normalizedValue) return normalizedValue;
  }

  return "";
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

const buildRestaurantPayload = (body, user) => {
  const name = firstText(
    body.name,
    body.restaurantName,
    body.restaurant_name,
    body.businessName,
    body.business_name,
    user?.name && `${user.name}'s Restaurant`
  );
  const email = firstText(
    body.email,
    body.contactEmail,
    body.contact_email,
    body.restaurantEmail,
    body.restaurant_email,
    user?.email
  );
  const phone = firstText(
    body.phone,
    body.mobile,
    body.contactNumber,
    body.contact_number,
    body.restaurantPhone,
    body.restaurant_phone,
    user?.phone,
    "0000000000"
  );
  const address = firstText(
    normalizeAddress(body.address),
    body.location?.address,
    body.fullAddress,
    body.full_address,
    user?.address,
    "Address not provided"
  );

  return {
    name,
    email,
    phone,
    cuisine: normalizeCuisine(body.cuisine || body.category || body.foodType),
    address,
    description: body.description,
    image: body.image,
    tags: body.tags,
    openingHours: body.openingHours,
    minimumOrderAmount: body.minimumOrderAmount,
    location: {
      type: "Point",
      coordinates: normalizeCoordinates(body),
    },
  };
};

const buildRestaurantUpdatePayload = (body) => {
  const allowedFields = [
    "name", "description", "image", "cuisine", "tags", "address",
    "phone", "openingHours", "minimumOrderAmount", "status",
  ];

  const payload = {};
  for (const field of allowedFields) {
    if (body[field] !== undefined) {
      payload[field] = body[field];
    }
  }

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

const canManageRestaurant = (user, restaurant) => {
  if (user?.role === "admin") return true;

  return restaurant.ownerId?.toString() === user?._id?.toString();
};

const getDateRange = (days) => {
  const parsedDays = Math.min(Math.max(toNumber(days) || 30, 1), 365);
  const from = new Date();
  from.setDate(from.getDate() - parsedDays);

  return { from, days: parsedDays };
};

// ==============================
// Create Restaurant
// ==============================
const createRestaurant = async (req, res) => {
  try {
    const restaurant = await Restaurant.create({
      ...buildRestaurantPayload(req.body, req.user),
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
    const page = Math.max(Number.parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(Math.max(Number.parseInt(req.query.limit, 10) || 12, 1), 50);
    const { search, cuisine, rating, deliveryTime } = req.query;
    const filter = { status: "approved" };

    if (search) {
      const safeSearch = escapeRegex(search);
      const searchExpression = new RegExp(safeSearch, "i");
      filter.$or = [
        { name: searchExpression },
        { cuisine: searchExpression },
        { tags: searchExpression },
        { address: searchExpression },
      ];
    }

    if (cuisine) {
      const normalizedCuisine = escapeRegex(cuisine.trim());
      // Restaurants can have multiple cuisines stored as "American, Fast Food".
      // Match the selected cuisine as a complete entry, not as an exact full string.
      filter.cuisine = new RegExp(`(^|\\s*,\\s*)${normalizedCuisine}(?=\\s*,\\s*|$)`, "i");
    }
    if (rating && !Number.isNaN(Number(rating))) filter.rating = { $gte: Number(rating) };
    if (deliveryTime && !Number.isNaN(Number(deliveryTime))) filter.averagePrepTime = { $lte: Number(deliveryTime) };

    const [restaurants, total] = await Promise.all([
      Restaurant.find(filter)
        .sort({ isOpen: -1, rating: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      Restaurant.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      count: restaurants.length,
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
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
      query.cuisine = new RegExp(escapeRegex(cuisine), "i");
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
// Restaurant Analytics Dashboard
// ==============================
const getRestaurantAnalytics = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Valid restaurant id is required",
      });
    }

    const restaurant = await Restaurant.findById(req.params.id);

    if (!restaurant) {
      return res.status(404).json({
        success: false,
        message: "Restaurant not found",
      });
    }

    if (!canManageRestaurant(req.user, restaurant)) {
      return res.status(403).json({
        success: false,
        message: "You can view analytics only for your own restaurant",
      });
    }

    const restaurantId = new mongoose.Types.ObjectId(req.params.id);
    const { from, days } = getDateRange(req.query.days);
    const orderMatch = {
      restaurantId,
      createdAt: { $gte: from },
    };

    const [
      orderSummary,
      statusBreakdown,
      topItems,
      recentOrders,
      reviewSummary,
      recentReviews,
      menuStats,
    ] = await Promise.all([
      Order.aggregate([
        { $match: orderMatch },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: "$totalAmount" },
            averageOrderValue: { $avg: "$totalAmount" },
            deliveredOrders: {
              $sum: { $cond: [{ $eq: ["$status", "delivered"] }, 1, 0] },
            },
            cancelledOrders: {
              $sum: { $cond: [{ $eq: ["$status", "cancelled"] }, 1, 0] },
            },
          },
        },
      ]),
      Order.aggregate([
        { $match: orderMatch },
        { $group: { _id: "$status", count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Order.aggregate([
        { $match: orderMatch },
        { $unwind: "$items" },
        {
          $group: {
            _id: "$items.menuItemId",
            quantitySold: { $sum: "$items.quantity" },
            revenue: {
              $sum: { $multiply: ["$items.quantity", "$items.price"] },
            },
          },
        },
        { $sort: { quantitySold: -1 } },
        { $limit: 5 },
        {
          $lookup: {
            from: "menuitems",
            localField: "_id",
            foreignField: "_id",
            as: "menuItem",
          },
        },
        { $unwind: { path: "$menuItem", preserveNullAndEmptyArrays: true } },
        {
          $project: {
            _id: 0,
            menuItemId: "$_id",
            name: { $ifNull: ["$menuItem.name", "Unknown item"] },
            quantitySold: 1,
            revenue: 1,
          },
        },
      ]),
      Order.find(orderMatch)
        .populate("userId", "name email")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userId totalAmount status paymentMethod createdAt"),
      Review.aggregate([
        { $match: { restaurantId } },
        {
          $group: {
            _id: null,
            totalReviews: { $sum: 1 },
            averageRating: { $avg: "$rating" },
            verifiedReviews: {
              $sum: { $cond: ["$isVerified", 1, 0] },
            },
          },
        },
      ]),
      Review.find({ restaurantId })
        .populate("userId", "name")
        .sort({ createdAt: -1 })
        .limit(5)
        .select("userId rating comment isVerified createdAt"),
      MenuItem.aggregate([
        { $match: { restaurantId } },
        {
          $group: {
            _id: null,
            totalItems: { $sum: 1 },
            availableItems: {
              $sum: { $cond: ["$isAvailable", 1, 0] },
            },
            averagePrice: { $avg: "$price" },
          },
        },
      ]),
    ]);

    const orders = orderSummary[0] || {};
    const reviews = reviewSummary[0] || {};
    const menu = menuStats[0] || {};

    res.status(200).json({
      success: true,
      restaurant: {
        id: restaurant._id,
        name: restaurant.name,
        cuisine: restaurant.cuisine,
        rating: restaurant.rating,
        totalReviews: restaurant.totalReviews,
      },
      period: {
        days,
        from,
        to: new Date(),
      },
      summary: {
        totalOrders: orders.totalOrders || 0,
        deliveredOrders: orders.deliveredOrders || 0,
        cancelledOrders: orders.cancelledOrders || 0,
        totalRevenue: Number((orders.totalRevenue || 0).toFixed(2)),
        averageOrderValue: Number((orders.averageOrderValue || 0).toFixed(2)),
        totalReviews: reviews.totalReviews || 0,
        averageRating: Number((reviews.averageRating || 0).toFixed(1)),
        verifiedReviews: reviews.verifiedReviews || 0,
        totalMenuItems: menu.totalItems || 0,
        availableMenuItems: menu.availableItems || 0,
        averageMenuPrice: Number((menu.averagePrice || 0).toFixed(2)),
      },
      statusBreakdown: statusBreakdown.map((item) => ({
        status: item._id,
        count: item.count,
      })),
      topItems,
      recentOrders,
      recentReviews,
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
      !canManageRestaurant(req.user, restaurant)
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
        returnDocument: 'after',
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

// ======================================
// Get Current Partner's Restaurant(s)
// ======================================
const getMyRestaurant = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({ ownerId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
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
  getRestaurantAnalytics,
  getMyRestaurant,
  updateRestaurant,
  deleteRestaurant,
};
