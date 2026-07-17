const Razorpay = require("razorpay");
const crypto = require("crypto");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const { sendNotificationEmail } = require("../services/notificationService");

let razorpayInstance;

const getRazorpay = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_SECRET) {
    throw new Error("RAZORPAY_KEY_ID or RAZORPAY_SECRET is missing in .env");
  }
  if (!razorpayInstance) {
    razorpayInstance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_SECRET,
    });
  }
  return razorpayInstance;
};

const normalizePaymentStatus = (status) => {
  if (!status) return "Pending";
  const normalized = status.toString().trim().toLowerCase();
  const aliases = {
    success: "Paid",
    successful: "Paid",
    completed: "Paid",
    complete: "Paid",
    paid: "Paid",
    pending: "Pending",
    failed: "Failed",
    failure: "Failed",
    refunded: "Refunded",
    refund: "Refunded",
  };
  return aliases[normalized] || status;
};

const normalizePaymentMethod = (method) => {
  if (!method) return "Card";
  const normalized = method.toString().trim().toLowerCase();
  const aliases = {
    "credit card": "Card",
    "debit card": "Card",
    card: "Card",
    stripe: "Card",
    upi: "UPI",
    netbanking: "NetBanking",
    "net banking": "NetBanking",
    wallet: "Wallet",
    cod: "Cash on Delivery",
    cash: "Cash on Delivery",
    "cash on delivery": "Cash on Delivery",
  };
  return aliases[normalized] || method;
};

const sendPaymentSuccessEmail = async (payment) => {
  const user = await User.findById(payment.userId).select("name email");
  if (!user?.email) return;

  await sendNotificationEmail(
    user.email,
    "Payment Successful",
    `
      <h2>Payment Successful</h2>
      <p>Hello ${user.name || "Customer"},</p>
      <p>Your payment has been completed successfully.</p>
      <p><strong>Order ID:</strong> ${payment.orderId}</p>
      <p><strong>Amount:</strong> ${payment.currency.toUpperCase()} ${payment.amount}</p>
      <p><strong>Payment ID:</strong> ${payment.razorpayPaymentId || "N/A"}</p>
    `
  );
};

const normalizeAddress = (address) => {
  if (typeof address === "string") return address;
  if (typeof address === "object" && address !== null) {
    return (
      address.street ||
      address.fullAddress ||
      address.address ||
      [address.street, address.city, address.state, address.zipCode]
        .filter(Boolean)
        .join(", ") ||
      JSON.stringify(address)
    );
  }
  return "Default delivery address";
};

// ======================================
// Get Payments
// ======================================
const getPayments = async (req, res) => {
  try {
    let filter = {};

    if (req.user.role === "customer") {
      filter.userId = req.user._id;
    }

    if (req.user.role === "restaurant") {
      const restaurants = await Restaurant.find({
        ownerId: req.user._id,
      }).select("_id");
      const orders = await Order.find({
        restaurantId: { $in: restaurants.map((r) => r._id) },
      }).select("_id");
      filter.orderId = { $in: orders.map((o) => o._id) };
    }

    if (
      req.query.orderId &&
      mongoose.Types.ObjectId.isValid(req.query.orderId)
    ) {
      filter.orderId = req.query.orderId;
    }

    const payments = await Payment.find(filter)
      .populate("orderId", "totalAmount status paymentStatus restaurantId")
      .populate("userId", "name email")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: payments.length,
      payments,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Create Manual Payment Record
// ======================================
const createPayment = async (req, res) => {
  try {
    const orderId =
      req.body.orderId || req.body._id || req.body.id || req.body.order?._id;
    let order;

    if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
      order = await Order.findById(orderId);
    }
    if (!order) {
      order = await Order.findOne().sort({ createdAt: -1 });
    }

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found. Create an order first.",
      });
    }

    const paymentStatus = normalizePaymentStatus(req.body.paymentStatus);
    const payment = await Payment.create({
      orderId: order._id,
      userId: req.body.userId || order.userId,
      amount: req.body.amount || order.totalAmount,
      currency: req.body.currency || "inr",
      paymentMethod: normalizePaymentMethod(req.body.paymentMethod),
      paymentStatus,
      razorpayOrderId: req.body.razorpayOrderId || "",
      razorpayPaymentId: req.body.razorpayPaymentId || "",
      razorpaySignature: req.body.razorpaySignature || "",
    });

    if (paymentStatus === "Paid") {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "Paid",
        status: "confirmed",
      });
      await sendPaymentSuccessEmail(payment);
    }

    res
      .status(201)
      .json({ success: true, message: "Payment recorded", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Update Payment
// ======================================
const updatePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid payment id required" });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (
      req.user.role !== "admin" &&
      payment.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own payment",
      });
    }

    if (req.body.amount !== undefined) payment.amount = req.body.amount;
    if (req.body.currency) payment.currency = req.body.currency;
    if (req.body.paymentMethod)
      payment.paymentMethod = normalizePaymentMethod(req.body.paymentMethod);
    if (req.body.paymentStatus)
      payment.paymentStatus = normalizePaymentStatus(req.body.paymentStatus);
    if (req.body.razorpayPaymentId)
      payment.razorpayPaymentId = req.body.razorpayPaymentId;
    if (req.body.razorpaySignature)
      payment.razorpaySignature = req.body.razorpaySignature;

    await payment.save();

    const order = await Order.findById(payment.orderId);
    if (order) {
      if (payment.paymentStatus === "Paid") {
        order.paymentStatus = "Paid";
        order.status = "confirmed";
      } else if (payment.paymentStatus === "Failed") {
        order.paymentStatus = "Pending";
      }
      await order.save();
    }

    res
      .status(200)
      .json({ success: true, message: "Payment updated", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Delete Payment
// ======================================
const deletePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid payment id required" });
    }

    const payment = await Payment.findById(req.params.id);
    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment not found" });
    }

    if (
      req.user.role !== "admin" &&
      payment.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can delete only your own payment",
      });
    }

    await Payment.deleteOne({ _id: payment._id });
    res
      .status(200)
      .json({ success: true, message: "Payment deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Create Razorpay Order
// ======================================
const createRazorpayOrder = async (req, res) => {
  try {
    const { orderId } = req.body;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return res
        .status(400)
        .json({ success: false, message: "Valid orderId is required" });
    }

    const order = await Order.findById(orderId);
    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    if (order.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You can only pay for your own orders",
      });
    }

    if (order.paymentStatus === "Paid") {
      return res
        .status(400)
        .json({ success: false, message: "Order is already paid" });
    }

    const razorpayOrder = await getRazorpay().orders.create({
      amount: Math.round(order.totalAmount * 100),
      currency: "INR",
      receipt: `order_${order._id}`,
      notes: {
        orderId: order._id.toString(),
        userId: req.user._id.toString(),
      },
    });

    await Payment.create({
      orderId: order._id,
      userId: req.user._id,
      razorpayOrderId: razorpayOrder.id,
      amount: order.totalAmount,
      currency: "INR",
      paymentMethod: normalizePaymentMethod(order.paymentMethod) || "Card",
      paymentStatus: "Pending",
    });

    res.status(201).json({
      success: true,
      razorpayOrderId: razorpayOrder.id,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      keyId: process.env.RAZORPAY_KEY_ID,
      customerName: req.user.name || "Customer",
      customerEmail: req.user.email || "",
      customerPhone: req.user.phone || "",
    });
  } catch (error) {
    console.error("Razorpay order creation error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Verify Razorpay Payment
// ======================================
const verifyRazorpayPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = req.body;

    if (!razorpayOrderId || !razorpayPaymentId || !razorpaySignature) {
      return res.status(400).json({
        success: false,
        message: "All payment details are required",
      });
    }

    const body = razorpayOrderId + "|" + razorpayPaymentId;
    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_SECRET)
      .update(body)
      .digest("hex");

    const isValid = expectedSignature === razorpaySignature;

    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: "Payment verification failed. Invalid signature.",
      });
    }

    const payment = await Payment.findOne({
      razorpayOrderId: razorpayOrderId,
    });

    if (!payment) {
      return res
        .status(404)
        .json({ success: false, message: "Payment record not found" });
    }

    const paymentDetails = await getRazorpay().payments.fetch(
      razorpayPaymentId
    );

    const methodMap = {
      card: "Card",
      upi: "UPI",
      netbanking: "NetBanking",
      wallet: "Wallet",
    };
    const paymentMethod =
      methodMap[paymentDetails.method] || paymentDetails.method || "Card";

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.paymentStatus = "Paid";
    payment.paymentMethod = paymentMethod;
    await payment.save();

    await Order.findByIdAndUpdate(payment.orderId, {
      paymentStatus: "Paid",
      status: "confirmed",
    });

    await sendPaymentSuccessEmail(payment);

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      payment,
    });
  } catch (error) {
    console.error("Payment verification error:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// Razorpay Webhook
// ======================================
const razorpayWebhook = async (req, res) => {
  try {
    const secret = process.env.RAZORPAY_SECRET;
    const signature = req.headers["x-razorpay-signature"];

    const expectedSignature = crypto
      .createHmac("sha256", secret)
      .update(req.body.toString())
      .digest("hex");

    if (signature !== expectedSignature) {
      return res.status(400).json({ success: false, message: "Invalid signature" });
    }

    const event = req.body;

    if (event.event === "payment.captured") {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;

      const payment = await Payment.findOne({ razorpayOrderId });

      if (payment && payment.paymentStatus !== "Paid") {
        payment.razorpayPaymentId = paymentData.id;
        payment.paymentStatus = "Paid";
        payment.paymentMethod = paymentData.method || "Card";
        await payment.save();

        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: "Paid",
          status: "confirmed",
        });

        await sendPaymentSuccessEmail(payment);
      }
    }

    if (event.event === "payment.failed") {
      const paymentData = event.payload.payment.entity;
      const razorpayOrderId = paymentData.order_id;

      const payment = await Payment.findOne({ razorpayOrderId });

      if (payment) {
        payment.paymentStatus = "Failed";
        await payment.save();
      }
    }

    res.status(200).json({ success: true, received: true });
  } catch (error) {
    console.error("Razorpay webhook error:", error.message);
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  createRazorpayOrder,
  verifyRazorpayPayment,
  razorpayWebhook,
};
