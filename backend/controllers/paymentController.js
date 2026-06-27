const Stripe = require("stripe");
const mongoose = require("mongoose");
const Payment = require("../models/Payment");
const Order = require("../models/Order");

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
  createCheckoutSession,
  verifyPayment,
  stripeWebhook,
};
