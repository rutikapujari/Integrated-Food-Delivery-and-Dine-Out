const User = require("../models/User");
const Order = require("../models/Order");
const Restaurant = require("../models/Restaurant");
const Payment = require("../models/Payment");

const getUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshToken").sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate("userId", "name email")
      .populate("restaurantId", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRevenue = async (req, res) => {
  try {
    const revenue = await Payment.aggregate([
      { $match: { paymentStatus: "Paid" } },
      { $group: { _id: null, totalRevenue: { $sum: "$amount" }, payments: { $sum: 1 } } },
    ]);

    res.status(200).json({
      success: true,
      totalRevenue: revenue[0]?.totalRevenue || 0,
      payments: revenue[0]?.payments || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find().sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: restaurants.length,
      restaurants,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getAnalytics = async (req, res) => {
  try {
    const [users, orders, restaurants, paidPayments] = await Promise.all([
      User.countDocuments(),
      Order.countDocuments(),
      Restaurant.countDocuments(),
      Payment.aggregate([
        { $match: { paymentStatus: "Paid" } },
        { $group: { _id: null, totalRevenue: { $sum: "$amount" } } },
      ]),
    ]);

    res.status(200).json({
      success: true,
      users,
      orders,
      restaurants,
      revenue: paidPayments[0]?.totalRevenue || 0,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !['customer', 'restaurant', 'admin'].includes(role)) {
      return res.status(400).json({
        success: false,
        message: 'Valid role is required (customer, restaurant, or admin)',
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    user.role = role;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'User role updated successfully',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getUsers,
  getOrders,
  getRevenue,
  getRestaurants,
  getAnalytics,
  updateUserRole,
};
