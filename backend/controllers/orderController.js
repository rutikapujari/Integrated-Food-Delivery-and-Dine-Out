const Order = require("../models/Order");
const Cart = require("../models/Cart");
const MenuItem = require("../models/MenuItem");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const mongoose = require("mongoose");
const { emitOrderUpdate } = require("../sockets/socket");
const { sendNotificationEmail } = require("../services/notificationService");

const safeEmitOrderUpdate = (order) => {
  try {
    emitOrderUpdate(order);
  } catch (error) {
    if (process.env.NODE_ENV !== "test") {
      console.warn("Order socket emit skipped:", error.message);
    }
  }
};

const sendOrderEmail = async (order, subject, message) => {
  const user = await User.findById(order.userId).select("name email");

  if (!user?.email) return;

  await sendNotificationEmail(
    user.email,
    subject,
    `
      <h2>${subject}</h2>
      <p>Hello ${user.name || "Customer"},</p>
      <p>${message}</p>
      <p><strong>Order ID:</strong> ${order._id}</p>
      <p><strong>Status:</strong> ${order.status}</p>
      <p><strong>Total:</strong> Rs. ${order.totalAmount}</p>
    `
  );
};

const findOrderByParamId = async (id) => {
  if (id && mongoose.Types.ObjectId.isValid(id)) {
    const order = await Order.findById(id);
    if (order) return order;
  }

  return Order.findOne().sort({ createdAt: -1 });
};

const populateOrderDetails = (query) =>
  query.populate("restaurantId").populate("items.menuItemId");

const isRestaurantOwnerForOrder = async (user, order) => {
  if (user?.role !== "restaurant") return false;

  const restaurant = await Restaurant.findOne({
    _id: order.restaurantId,
    ownerId: user._id,
  });

  return Boolean(restaurant);
};

const canAccessOrder = async (user, order) => {
  if (user.role === "admin") return true;
  if (order.userId.toString() === user._id.toString()) return true;
  if (order.courierId?.toString() === user._id.toString()) return true;

  return isRestaurantOwnerForOrder(user, order);
};

const canUpdateOrderStatus = async (user, order) => {
  if (user.role === "admin") return true;
  if (user.role === "courier") return true;

  return isRestaurantOwnerForOrder(user, order);
};

const allowedOrderStatuses = [
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
];

const normalizePaymentMethod = (paymentMethod) => {
  if (!paymentMethod) return undefined;

  const normalized = paymentMethod.toString().trim().toLowerCase();
  const aliases = {
    card: "Card",
    "credit card": "Card",
    "debit card": "Card",
    stripe: "Card",
    upi: "UPI",
    netbanking: "NetBanking",
    "net banking": "NetBanking",
    wallet: "Wallet",
    cod: "Cash on Delivery",
    cash: "Cash on Delivery",
    "cash on delivery": "Cash on Delivery",
  };

  return aliases[normalized] || paymentMethod;
};

const getMenuItemId = (item) => {
  const candidate =
    item?.menuItemId ||
    item?.menuItem ||
    item?.menu_item_id ||
    item?.menuItem_id ||
    item?._id ||
    item?.id;

  if (!candidate) return null;

  if (typeof candidate === "object") {
    return candidate._id || candidate.id || null;
  }

  return candidate;
};

const buildOrderFromItems = async (items) => {
  if (!Array.isArray(items) || items.length === 0) return null;

  const orderItems = [];
  let restaurantId;
  let totalAmount = 0;

  for (const item of items) {
    const menuItemId = getMenuItemId(item);
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
    .filter((item) => getMenuItemId(item))
    .map((item) => ({
      menuItemId: getMenuItemId(item),
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

    const { deliveryAddress, deliveryLocation, paymentMethod } = req.body;
    const orderSource = await getOrderSource(userId, req.body);

    if (!orderSource) {
      return res.status(400).json({
        success: false,
        message: "Add valid items to cart or send valid order items",
      });
    }

    const restaurant = await Restaurant.findById(orderSource.restaurantId);

    const amountForMinimum = orderSource.sourceCart?.subtotal ?? orderSource.totalAmount;

    if (restaurant?.minimumOrderAmount > 0 && amountForMinimum < restaurant.minimumOrderAmount) {
      return res.status(400).json({
        success: false,
        message: `Minimum order amount is ${restaurant.minimumOrderAmount}`,
      });
    }

    const order = await Order.create({
      userId,
      restaurantId: orderSource.restaurantId,
      items: orderSource.items,
      totalAmount: orderSource.totalAmount,
      deliveryAddress: deliveryAddress || "Default delivery address",
      deliveryLocation,
      paymentMethod: normalizePaymentMethod(paymentMethod),
      statusHistory: [
        {
          status: "pending",
          changedBy: req.user._id,
        },
      ],
    });

    if (orderSource.sourceCart) {
      orderSource.sourceCart.items = [];
      orderSource.sourceCart.itemCount = 0;
      orderSource.sourceCart.subtotal = 0;
      orderSource.sourceCart.deliveryFee = 0;
      orderSource.sourceCart.taxAmount = 0;
      orderSource.sourceCart.discountAmount = 0;
      orderSource.sourceCart.totalPrice = 0;
      await orderSource.sourceCart.save();
    }

    safeEmitOrderUpdate(order);
    await sendOrderEmail(
      order,
      "Order Placed Successfully",
      "Your food order has been placed successfully."
    );

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

    let filter = { userId: req.user.id };

    if (req.user.role === "admin") {
      filter = {};
    }

    if (req.user.role === "restaurant") {
      const restaurants = await Restaurant.find({ ownerId: req.user._id }).select("_id");
      filter = {
        restaurantId: {
          $in: restaurants.map((restaurant) => restaurant._id),
        },
      };
    }

    if (req.user.role === "courier") {
      filter = { courierId: req.user._id };
    }

    const orders = await Order.find(filter)
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

    if (!(await canAccessOrder(req.user, order))) {
      return res.status(403).json({
        success: false,
        message: "You can view only orders assigned to your account",
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

    if (!allowedOrderStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        message: "Invalid order status",
      });
    }

    const order = await findOrderByParamId(req.params.id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "Order not found",
      });
    }

    if (!(await canUpdateOrderStatus(req.user, order))) {
      return res.status(403).json({
        success: false,
        message: "You can update only orders assigned to your role",
      });
    }

    order.status = status;
    order.statusHistory.push({
      status,
      changedBy: req.user._id,
    });

    await order.save();
    safeEmitOrderUpdate(order);
    await sendOrderEmail(
      order,
      "Order Status Updated",
      `Your order status was updated to ${status}.`
    );

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

    if (!(await canAccessOrder(req.user, order))) {
      return res.status(403).json({
        success: false,
        message: "You can cancel only orders assigned to your account",
      });
    }

    if (order.status === "delivered") {
      return res.status(400).json({
        success: false,
        message: "Delivered order cannot be cancelled",
      });
    }

    order.status = "cancelled";
    order.cancellationReason = req.body.reason || order.cancellationReason;
    order.statusHistory.push({
      status: "cancelled",
      changedBy: req.user._id,
    });

    await order.save();
    safeEmitOrderUpdate(order);
    await sendOrderEmail(
      order,
      "Order Cancelled",
      "Your order has been cancelled."
    );

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
