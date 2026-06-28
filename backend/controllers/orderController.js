const Order = require("../models/Order");
const Cart = require("../models/Cart");
const MenuItem = require("../models/Menuitem");
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

const buildOrderFromItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const orderItems = [];
  let restaurantId;
  let totalAmount = 0;

  for (const item of items) {
    const menuItemId = item.menuItemId || item._id || item.id;
    if (!mongoose.Types.ObjectId.isValid(menuItemId)) continue;

    const menuItem = await MenuItem.findById(menuItemId);
    if (!menuItem) continue;

    const quantity = Math.max(Number(item.quantity || 1), 1);

    restaurantId = restaurantId || menuItem.restaurantId;
    totalAmount += menuItem.price * quantity;
    orderItems.push({
      menuItemId: menuItem._id,
      quantity,
      price: menuItem.price,
    });
  }

  if (orderItems.length === 0) return null;

  return {
    restaurantId,
    items: orderItems,
    totalAmount,
    sourceCart: null,
  };
};

const buildOrderFromCart = (cart) => {
  if (!cart || !cart.items || cart.items.length === 0) return null;

  const orderItems = cart.items
    .filter((item) => item.menuItemId)
    .map((item) => ({
      menuItemId: item.menuItemId._id,
      quantity: item.quantity,
      price: item.menuItemId.price,
    }));

  if (orderItems.length === 0) return null;

  return {
    restaurantId: cart.restaurantId,
    items: orderItems,
    totalAmount: cart.totalPrice,
    sourceCart: cart,
  };
};

const getOrderSource = async (userId, body) => {
  const bodyOrder = await buildOrderFromItems(body.items);
  if (bodyOrder) return bodyOrder;

  const userCart = await Cart.findOne({
    userId,
    "items.0": { $exists: true },
  }).populate("items.menuItemId");
  const userCartOrder = buildOrderFromCart(userCart);
  if (userCartOrder) return userCartOrder;

  return null;
};

// ====================================
// Create Order From Cart
// ====================================
const createOrder = async (req, res) => {
  try {
    const userId = req.user.id;

    const { deliveryAddress, paymentMethod } = req.body;
    const orderSource = await getOrderSource(userId, req.body);

    if (!orderSource) {
      return res.status(400).json({
        success: false,
        message: "Add valid items to cart or send valid order items",
      });
    }

    const order = await Order.create({
      userId,
      restaurantId: orderSource.restaurantId,
      items: orderSource.items,
      totalAmount: orderSource.totalAmount,
      deliveryAddress: deliveryAddress || "Default delivery address",
      paymentMethod,
    });

    if (orderSource.sourceCart) {
      orderSource.sourceCart.items = [];
      orderSource.sourceCart.totalPrice = 0;
      await orderSource.sourceCart.save();
    }

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

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can view only your own order",
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

    if (
      req.user.role !== "admin" &&
      order.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can cancel only your own order",
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
