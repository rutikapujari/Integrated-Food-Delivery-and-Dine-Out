const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");

const connectDB = require("./config/db");
const paymentRoutes = require("./routes/paymentRoutes");
const testRoutes = require("./routes/test.routes");
const { stripeWebhook } = require("./controllers/paymentController");

dotenv.config({ path: path.join(__dirname, ".env") });

connectDB();

const app = express();

app.post(
  "/api/payments/webhook",
  express.raw({ type: "application/json" }),
  stripeWebhook
);

app.use(helmet());
app.use(compression());
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(cors({
  origin: process.env.CLIENT_URL || "*",
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reservations", require("./routes/reservation"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/payments", paymentRoutes);
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api", testRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("Food Delivery API is Running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
