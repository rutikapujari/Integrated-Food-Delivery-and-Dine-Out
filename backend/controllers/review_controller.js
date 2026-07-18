const Review = require("../models/Review");
const User = require("../models/User");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const MenuItem = require("../models/MenuItem");
const mongoose = require("mongoose");

// TODO (Week 3): Review Engine follow-ups
// See: backend/docs/week-3.md
// - Add tests for review lifecycle and rating aggregation
// - Consider moderation workflow and flags for admin review

const getRestaurantForReview = async (restaurantId) => {
  if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
    const restaurant = await Restaurant.findById(restaurantId);
    if (restaurant) return restaurant;
  }

  return null;
};

const getDeliveredOrderForReview = async (orderId, userId, restaurantId) => {
  const baseQuery = {
    userId,
    status: "delivered",
  };

  if (restaurantId && mongoose.Types.ObjectId.isValid(restaurantId)) {
    baseQuery.restaurantId = restaurantId;
  }

  if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    const order = await Order.findOne({
      ...baseQuery,
      _id: orderId,
    });

    if (order) return order;
  }

  if (baseQuery.restaurantId) {
    return Order.findOne(baseQuery).sort({ createdAt: -1 });
  }

  return null;
};

const normalizeReviewPayload = (body) => ({
  restaurantId: body.restaurantId || body.restaurant || body.restaurant_id,
  orderId: body.orderId || body.order || body.order_id,
  rating: body.rating,
  comment: body.comment || body.review || body.feedback,
  image: body.image || body.imageUrl || body.image_url || "",
});

const validateReviewPayload = ({ restaurantId, orderId, rating, comment }) => {
  const missingFields = [];

  if (!orderId && !restaurantId) missingFields.push("orderId or restaurantId");
  if (!rating) missingFields.push("rating");
  if (!comment) missingFields.push("comment");

  return missingFields;
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
    } = normalizeReviewPayload(req.body);

    const missingFields = validateReviewPayload({
      restaurantId,
      orderId,
      rating,
      comment,
    });

    if (missingFields.length) {
      return res.status(400).json({
        success: false,
        message: `Missing required review fields: ${missingFields.join(", ")}`,
      });
    }

    const order = await getDeliveredOrderForReview(orderId, userId, restaurantId);
    const restaurant = order ? null : await getRestaurantForReview(restaurantId);

    if (!order && !restaurant) {
      return res.status(400).json({
        success: false,
        message: "A valid restaurantId or delivered order is required to review",
      });
    }
    const resolvedRestaurantId = order?.restaurantId || restaurant._id;
    const verifiedReview = Boolean(order);

    // Prevent duplicate review
    const alreadyReviewed = await Review.findOne(
      order
        ? {
            orderId: order._id,
            userId,
          }
        : {
            orderId: null,
            restaurantId: resolvedRestaurantId,
            userId,
          }
    );

    let points = 5;

    if ((comment || "").length >= 100) points += 5;
    if (image) points += 5;
    if (verifiedReview) points += 5; // Verified Order Bonus

    if (alreadyReviewed) {
      alreadyReviewed.rating = rating || alreadyReviewed.rating;
      alreadyReviewed.comment = comment || alreadyReviewed.comment;
      alreadyReviewed.image = image || alreadyReviewed.image;
      alreadyReviewed.pointsAwarded = points;
      alreadyReviewed.isVerified = verifiedReview;

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
      orderId: order?._id || null,
      rating,
      comment,
      image,
      pointsAwarded: points,
      isVerified: verifiedReview,
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
// Get Reviews By Current User
// ======================================
const getMyReviews = async (req, res) => {

  try {

    const reviews = await Review.find({ userId: req.user.id })
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

    if (
      req.user.role !== "admin" &&
      review.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own review",
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

    if (
      req.user.role !== "admin" &&
      review.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own review",
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
  getMyReviews,
  updateReview,
  deleteReview,
};
