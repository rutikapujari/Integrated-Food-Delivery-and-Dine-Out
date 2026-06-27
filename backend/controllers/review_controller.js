const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const mongoose = require("mongoose");

const getRestaurantForReview = async (restaurantId) => {
  if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) return restaurant;
  }

  const existingRestaurant = await Restaurant.findOne().sort({ createdAt: -1 });
  if (existingRestaurant) return existingRestaurant;

  return Restaurant.create({
    name: "Default Restaurant",
    cuisine: "Multi Cuisine",
    description: "Auto-created restaurant for review testing",
    address: "Default Address",
    phone: "0000000000",
    email: "default@restaurant.local",
    location: {
      type: "Point",
      coordinates: [0, 0],
    },
  });
};

const getDeliveredOrderForReview = async (orderId, userId, restaurantId) => {
  if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    const order = await Order.findOne({
      _id: orderId,
      userId,
      status: "delivered",
    });

    if (order) return order;
  }

  const restaurant = await getRestaurantForReview(restaurantId);
  let menuItem = await MenuItem.findOne({ restaurantId: restaurant._id }).sort({
    createdAt: -1,
  });

  if (!menuItem) {
    menuItem = await MenuItem.create({
      restaurantId: restaurant._id,
      name: "Default Review Item",
      description: "Auto-created menu item for review testing",
      category: "General",
      price: 100,
      image: "",
      isAvailable: true,
    });
  }

  return Order.create({
    userId,
    restaurantId: restaurant._id,
    items: [
      {
        menuItemId: menuItem._id,
        quantity: 1,
        price: menuItem.price,
      },
    ],
    totalAmount: menuItem.price,
    deliveryAddress: "Default Address",
    paymentMethod: "Cash on Delivery",
    status: "delivered",
  });
};

// ======================================
// Update Restaurant Average Rating
// ======================================
const updateRestaurantRating = async (restaurantId) => {
  const reviews = await Review.find({ restaurantId });

  if (reviews.length === 0) {
    await Restaurant.findByIdAndUpdate(restaurantId, {
      rating: 0,
      totalReviews: 0,
    });
    return;
  }

  const totalRating = reviews.reduce(
    (sum, review) => sum + review.rating,
    0
  );

  const averageRating = totalRating / reviews.length;

  await Restaurant.findByIdAndUpdate(restaurantId, {
    rating: averageRating.toFixed(1),
    totalReviews: reviews.length,
  });
};

// ======================================
// Create Review
// ======================================
const createReview = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      restaurantId,
      orderId,
      rating,
      comment,
      image,
    } = req.body;

    const order = await getDeliveredOrderForReview(orderId, userId, restaurantId);
    const resolvedRestaurantId = order.restaurantId;

    // Prevent duplicate review
    const alreadyReviewed = await Review.findOne({
      orderId: order._id,
      userId,
    });

    let points = 5;

    if ((comment || "").length >= 100) points += 5;
    if (image) points += 5;
    points += 5; // Verified Order Bonus

    if (alreadyReviewed) {
      alreadyReviewed.rating = rating || alreadyReviewed.rating;
      alreadyReviewed.comment = comment || alreadyReviewed.comment;
      alreadyReviewed.image = image || alreadyReviewed.image;
      alreadyReviewed.pointsAwarded = points;
      alreadyReviewed.isVerified = true;

      await alreadyReviewed.save();
      await updateRestaurantRating(resolvedRestaurantId);

      return res.status(200).json({
        success: true,
        message: "Review updated successfully",
        loyaltyPointsEarned: points,
        review: alreadyReviewed,
      });
    }

    const review = await Review.create({
      userId,
      restaurantId: resolvedRestaurantId,
      orderId: order._id,
      rating,
      comment,
      image,
      pointsAwarded: points,
      isVerified: true,
    });

    // Update loyalty points
    await User.findByIdAndUpdate(userId, {
      $inc: {
        loyaltyPoints: points,
      },
    });

    // Update restaurant rating
    await updateRestaurantRating(resolvedRestaurantId);

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      loyaltyPointsEarned: points,
      review,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Get All Reviews
// ======================================
const getReviews = async (req, res) => {

  try {

    const reviews = await Review.find()
      .populate("userId", "name")
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================
// Get Review By ID
// ======================================
const getReviewById = async (req, res) => {

  try {

    const review = await Review.findById(req.params.id)
      .populate("userId", "name email")
      .populate("restaurantId", "name");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      review,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================
// Get Restaurant Reviews
// ======================================
const getRestaurantReviews = async (req, res) => {

  try {

    const reviews = await Review.find({
      restaurantId: req.params.restaurantId,
    }).populate("userId", "name");

    res.status(200).json({
      success: true,
      count: reviews.length,
      reviews,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================
// Update Review
// ======================================
const updateReview = async (req, res) => {

  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.rating = req.body.rating || review.rating;
    review.comment = req.body.comment || review.comment;

    await review.save();

    await updateRestaurantRating(review.restaurantId);

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      review,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

// ======================================
// Delete Review
// ======================================
const deleteReview = async (req, res) => {

  try {

    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    await review.deleteOne();

    await updateRestaurantRating(review.restaurantId);

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }

};

module.exports = {
  createReview,
  getReviews,
  getReviewById,
  getRestaurantReviews,
  updateReview,
  deleteReview,
};
