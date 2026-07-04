const Stripe = require("stripe");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");
const User = require("../models/User");
const Restaurant = require("../models/Restaurant");
const { sendNotificationEmail } = require("../services/notificationService");

// TODO (Week 3): Checkout System review
// See: backend/docs/week-3.md
// - Add server-side order total validation before creating Stripe session
// - Add integration tests for checkout and verify endpoints

let stripe;

const getStripe = () => {
  if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error("STRIPE_SECRET_KEY is missing in backend/.env");
  }

  if (!stripe) {
    stripe = Stripe(process.env.STRIPE_SECRET_KEY);
  }

  return stripe;
};

const getOrderIdFromRequest = (body) =>
  body.orderId ||
  body._id ||
  body.id ||
  body.order?._id ||
  body.order?.id;

const findCheckoutOrder = async (orderId) => {
  if (orderId && mongoose.Types.ObjectId.isValid(orderId)) {
    const order = await Order.findById(orderId);
    if (order) return order;
  }

  return Order.findOne().sort({ createdAt: -1 });
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
  if (!method) return "card";

  const normalized = method.toString().trim().toLowerCase();
  const aliases = {
    "credit card": "card",
    "debit card": "card",
    card: "card",
    stripe: "card",
    upi: "UPI",
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
    `
  );
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
      const restaurants = await Restaurant.find({ ownerId: req.user._id }).select("_id");
      const orders = await Order.find({
        restaurantId: {
          $in: restaurants.map((restaurant) => restaurant._id),
        },
      }).select("_id");
      filter.orderId = {
        $in: orders.map((order) => order._id),
      };
    }

    if (req.query.orderId && mongoose.Types.ObjectId.isValid(req.query.orderId)) {
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
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Manual Payment Record
// ======================================
const createPayment = async (req, res) => {
  try {
    const orderId = getOrderIdFromRequest(req.body);
    const order = await findCheckoutOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found. Create an order first, then create payment.",
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
      stripeSessionId: req.body.stripeSessionId || "",
      stripePaymentIntentId:
        req.body.transactionId ||
        req.body.stripePaymentIntentId ||
        req.body.paymentIntentId ||
        "",
    });

    if (paymentStatus === "Paid") {
      await Order.findByIdAndUpdate(order._id, {
        paymentStatus: "Paid",
        status: "confirmed",
      });

      await sendPaymentSuccessEmail(payment);
    }

    res.status(201).json({
      success: true,
      message: "Payment recorded successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Update Payment
// ======================================
const updatePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment id is required",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    const order = await Order.findById(payment.orderId);

    if (
      req.user.role !== "admin" &&
      payment.userId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can update only your own payment",
      });
    }

    if (req.body.amount !== undefined) {
      payment.amount = req.body.amount;
    }

    if (req.body.currency) {
      payment.currency = req.body.currency;
    }

    if (req.body.paymentMethod) {
      payment.paymentMethod = normalizePaymentMethod(req.body.paymentMethod);
    }

    if (req.body.paymentStatus) {
      payment.paymentStatus = normalizePaymentStatus(req.body.paymentStatus);
    }

    if (req.body.transactionId || req.body.stripePaymentIntentId || req.body.paymentIntentId) {
      payment.stripePaymentIntentId =
        req.body.transactionId ||
        req.body.stripePaymentIntentId ||
        req.body.paymentIntentId;
    }

    if (req.body.stripeSessionId !== undefined) {
      payment.stripeSessionId = req.body.stripeSessionId;
    }

    await payment.save();

    if (order) {
      if (payment.paymentStatus === "Paid") {
        order.paymentStatus = "Paid";
        order.status = "confirmed";
      } else if (payment.paymentStatus === "Failed") {
        order.paymentStatus = "Pending";
      }

      await order.save();
    }

    res.status(200).json({
      success: true,
      message: "Payment updated successfully",
      payment,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Delete Payment
// ======================================
const deletePayment = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({
        success: false,
        message: "Valid payment id is required",
      });
    }

    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
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

    res.status(200).json({
      success: true,
      message: "Payment deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ======================================
// Create Stripe Checkout Session
// ======================================
const createCheckoutSession = async (req, res) => {
  try {
    const orderId = getOrderIdFromRequest(req.body);
    const order = await findCheckoutOrder(orderId);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: "No order found. Create an order first, then start checkout.",
      });
    }

    // Server-side validation: recompute order total from items and compare
    try {
      const computedTotal = (order.items || []).reduce((sum, it) => {
        const price = typeof it.price === 'number' ? it.price : Number(it.price || 0);
        const qty = typeof it.quantity === 'number' ? it.quantity : Number(it.quantity || 0);
        return sum + price * qty;
      }, 0);

      // Allow small rounding difference
      const diff = Math.abs(computedTotal - Number(order.totalAmount || 0));
      if (diff > 0.5) {
        return res.status(400).json({
          success: false,
          message: `Order total mismatch: expected ${computedTotal}, actual ${order.totalAmount}`,
        });
      }
    } catch (e) {
      // If validation fails unexpectedly, log and continue conservatively
      console.warn('Order total validation failed', e.message || e);
    }

    const session = await getStripe().checkout.sessions.create({
      payment_method_types: ["card"],

      line_items: [
        {
          price_data: {
            currency: "inr",
            product_data: {
              name: `Food Order #${order._id}`,
            },
            unit_amount: Math.round(order.totalAmount * 100),
          },
          quantity: 1,
        },
      ],

      mode: "payment",

      success_url: `${process.env.CLIENT_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}`,

      cancel_url: `${process.env.CLIENT_URL}/payment-cancel`,
    });

    await Payment.create({
      orderId: order._id,
      userId: order.userId,
      stripeSessionId: session.id,
      amount: order.totalAmount,
      currency: "inr",
      paymentMethod: "card",
      paymentStatus: "Pending",
    });

    res.status(200).json({
      success: true,
      checkoutUrl: session.url,
      sessionId: session.id,
    });

  } catch (error) {

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Verify Payment
// ======================================
const verifyPayment = async (req, res) => {
  try {
    const { sessionId } = req.body;

    const session = await getStripe().checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== "paid") {
      return res.status(400).json({
        success: false,
        message: "Payment not completed",
      });
    }

    const payment = await Payment.findOne({
      stripeSessionId: sessionId,
    });

    if (!payment) {
      return res.status(404).json({
        success: false,
        message: "Payment not found",
      });
    }

    payment.paymentStatus = "Paid";
    payment.stripePaymentIntentId = session.payment_intent;

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

    res.status(500).json({
      success: false,
      message: error.message,
    });

  }
};

// ======================================
// Stripe Webhook
// ======================================
const stripeWebhook = async (req, res) => {
  try {

    const sig = req.headers["stripe-signature"];

    const event = getStripe().webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (event.type === "checkout.session.completed") {

      const session = event.data.object;

      const payment = await Payment.findOne({
        stripeSessionId: session.id,
      });

      if (payment) {

        payment.paymentStatus = "Paid";
        payment.stripePaymentIntentId = session.payment_intent;

        await payment.save();

        await Order.findByIdAndUpdate(payment.orderId, {
          paymentStatus: "Paid",
          status: "confirmed",
        });

        await sendPaymentSuccessEmail(payment);

      }
    }

    res.status(200).json({
      received: true,
    });

  } catch (error) {

    console.log(error.message);

    res.status(400).send(`Webhook Error: ${error.message}`);
  }
};

module.exports = {
  getPayments,
  createPayment,
  updatePayment,
  deletePayment,
  createCheckoutSession,
  verifyPayment,
  stripeWebhook,
};
