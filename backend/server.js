const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { initializeSocket } = require("./sockets/socket");

dotenv.config({ path: path.join(__dirname, ".env") });

const paymentRoutes = require("./routes/paymentRoutes");
const connectDB = require("./config/db");

connectDB();

const app = express();

app.use(cors());
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
app.use("/api/orders", require("./routes/orderRoutes"));
app.use("/api/reservations", require("./routes/reservation"));
app.use("/api/reviews", require("./routes/review"));
app.use("/api/payments", paymentRoutes);
// Home Route
app.get("/", (req, res) => {
  res.send("Food Delivery API is Running...");
});

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

initializeSocket(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
