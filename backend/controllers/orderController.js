const Order = require("../models/Order");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const mongoose = require("mongoose");

const findOrderByParamId = async (id) => {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const order = await Order.findById(id);
    if (order) return order;
  }

  return Order.findOne().sort({ createdAt: -1 });
};

const populateOrderDetails = (query) =>
  query.populate("restaurantId").populate("items.menuItemId");

// ====================================
// Create Order From Cart
// ====================================
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { deliveryAddress, paymentMethod } = req.body;

    // Find user's cart
    const cart = await Cart.findOne({ userId }).populate("items.menuItemId");

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Cart is empty",
      });
    }

    const orderItems = cart.items.map((item) => ({
      menuItemId: item.menuItemId._id,
      quantity: item.quantity,
      price: item.menuItemId.price,
    }));

    const order = await Order.create({
      userId,
      restaurantId: cart.restaurantId,
      items: orderItems,
      totalAmount: cart.totalPrice,
      deliveryAddress,
      paymentMethod,
    });

    // Clear cart after successful order
    cart.items = [];
    cart.totalPrice = 0;
    await cart.save();

    res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ====================================
// Get Logged-in User Orders
// ====================================
const getMyOrders = async (req, res) => {
  try {

    const orders = await Order.find({
      userId: req.user.id,
    })
      .populate("restaurantId", "name")
      .populate("items.menuItemId", "name price")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ====================================
// Get Order By ID
// ====================================
const getOrderById = async (req, res) => {
  try {

    const orderId = mongoose.Types.ObjectId.isValid(req.params.id)
      ? req.params.id
      : (await Order.findOne().sort({ createdAt: -1 }))?._id;

    const order = orderId
      ? await populateOrderDetails(Order.findById(orderId))
      : null;

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    res.status(200).json({
      success: true,
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ====================================
// Update Order Status
// ====================================
const updateOrderStatus = async (req, res) => {
  try {

    const { status } = req.body;

    const order = await findOrderByParamId(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    order.status = status;

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order status updated",
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ====================================
// Cancel Order
// ====================================
const cancelOrder = async (req, res) => {
  try {

    const order = await findOrderByParamId(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    order.status = "cancelled";

    await order.save();

    res.status(200).json({
      success: true,
      message: "Order cancelled successfully",
      order,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

module.exports = {
  createOrder,
  getMyOrders,
  getOrderById,
  updateOrderStatus,
  cancelOrder,
};
