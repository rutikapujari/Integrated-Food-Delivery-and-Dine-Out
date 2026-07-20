const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
const helmet = require("helmet");
const compression = require("compression");
const morgan = require("morgan");
const path = require("path");
const http = require("http");
const { initializeSocket } = require("./sockets/socket");

dotenv.config({ path: path.join(__dirname, ".env") });

const paymentRoutes = require("./routes/paymentRoutes");
const connectDB = require("./config/db");

const app = express();

const allowedOrigins = (process.env.CLIENT_ORIGIN || "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);
app.use(helmet());
app.use(compression());
app.use(morgan("dev"));
app.use(cookieParser());

app.use("/api/payments/webhook", express.raw({ type: "application/json" }));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.get("/reset/:token", (req, res) => {
  res.redirect(`/api/auth/reset/${req.params.token}`);
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reservations", require("./routes/reservation"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/payments", paymentRoutes);
app.use("/api/notifications", require("./routes/notificationRoutes"));
app.use("/api/support", require("./routes/supportRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));
app.use("/api/upload", require("./routes/uploadRoutes"));
app.use("/api/test", require("./routes/test.routes"));
app.use("/api/ai", require("./routes/aiRoutes"));
app.use("/api/events", require("./routes/eventRoutes"));
// Home Route
app.get("/", (req, res) => {
  res.send("Food Delivery API is Running...");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

const startServer = async () => {
  await connectDB();

  server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

server.on("error", (error) => {
  if (error.code === "EADDRINUSE") {
    console.error(
      `Port ${PORT} is already in use. Stop the other process or set a different PORT in backend/.env.`
    );
    process.exit(1);
  }

  console.error("Server Error:", error.message);
  process.exit(1);
});

startServer();
