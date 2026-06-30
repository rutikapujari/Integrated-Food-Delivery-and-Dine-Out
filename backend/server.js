const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
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
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/reset/:token", (req, res) => {
  res.redirect(`/api/auth/reset/${req.params.token}`);
});

// Routes
app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/restaurants", require("./routes/restaurantRoutes"));
app.use("/api/menu", require("./routes/menuRoutes"));
app.use("/api/cart", require("./routes/cart"));
app.use("/api/carts", require("./routes/cart"));
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reservations", require("./routes/reservation"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/payments", paymentRoutes);
app.use("/api/admin", require("./routes/adminRoutes"));
// Home Route
app.get("/", (req, res) => {
  res.send("Food Delivery API is Running...");
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
