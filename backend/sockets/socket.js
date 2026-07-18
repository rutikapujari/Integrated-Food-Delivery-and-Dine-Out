const jwt = require("jsonwebtoken");
const User = require("../models/User");

let io;

const parseCookieHeader = (cookieHeader = "") =>
  cookieHeader.split(";").reduce((cookies, cookie) => {
    const [key, ...valueParts] = cookie.trim().split("=");
    if (!key) return cookies;

    cookies[key] = decodeURIComponent(valueParts.join("="));
    return cookies;
  }, {});

const normalizeOrigins = () => {
  const configuredOrigins = process.env.CLIENT_ORIGIN || "http://localhost:5173";
  return configuredOrigins.split(",").map((origin) => origin.trim()).filter(Boolean);
};

const getTokenFromSocket = (socket) => {
  const authToken = socket.handshake.auth?.token;
  const bearerToken = socket.handshake.headers?.authorization;
  const cookies = parseCookieHeader(socket.handshake.headers?.cookie);

  if (authToken) return authToken;
  if (bearerToken?.startsWith("Bearer ")) return bearerToken.split(" ")[1];
  if (cookies.accessToken) return cookies.accessToken;
  if (cookies.token) return cookies.token;

  return null;
};

const attachSocketUser = async (socket, next) => {
  try {
    const token = getTokenFromSocket(socket);

    if (!token || !process.env.JWT_SECRET) {
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("_id name role");

    if (user) {
      socket.user = user;
    }

    next();
  } catch (error) {
    next();
  }
};

const joinUserRooms = (socket) => {
  if (!socket.user) return;

  socket.join(`user:${socket.user._id}`);
  socket.join(`role:${socket.user.role}`);
};

const initializeSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: normalizeOrigins(),
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.use(attachSocketUser);

  io.on("connection", (socket) => {
    joinUserRooms(socket);
    console.log("Socket connected:", socket.id);

    const joinOrderRoom = (orderId) => {
      if (!orderId) return;
      socket.join(`order:${orderId}`);
      socket.join(orderId);
      console.log(`User joined order room: ${orderId}`);
    };

    const leaveOrderRoom = (orderId) => {
      if (!orderId) return;
      socket.leave(`order:${orderId}`);
      socket.leave(orderId);
      console.log(`User left order room: ${orderId}`);
    };

    socket.on("joinOrder", (orderId) => joinOrderRoom(orderId));
    socket.on("leaveOrder", (orderId) => leaveOrderRoom(orderId));

    // Frontend compatibility: accepts { room: "order:<id>" } or a raw orderId
    socket.on("join", (payload) => {
      const orderId =
        payload?.room?.replace(/^order:/, "") ||
        payload?.orderId ||
        payload?.room;
      joinOrderRoom(orderId);
    });

    socket.on("leave", (payload) => {
      const orderId =
        payload?.room?.replace(/^order:/, "") ||
        payload?.orderId ||
        payload?.room;
      leaveOrderRoom(orderId);
    });

    socket.on("joinRestaurant", (restaurantId) => {
      if (!restaurantId) return;
      socket.join(`restaurant:${restaurantId}`);
    });

    socket.on("leaveRestaurant", (restaurantId) => {
      if (!restaurantId) return;
      socket.leave(`restaurant:${restaurantId}`);
    });

    socket.on("joinCourier", () => {
      socket.join("role:courier");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.IO has not been initialized.");
  }
  return io;
};

const emitOrderUpdate = (order) => {
  if (!order?._id) return;

  const socket = getIO();
  const orderPayload = {
    orderId: order._id,
    status: order.status,
    order,
  };

  socket.to(`order:${order._id}`).to(order._id.toString()).emit("orderUpdate", orderPayload);
  socket.to(`user:${order.userId}`).emit("orderUpdate", orderPayload);
  socket.to(`restaurant:${order.restaurantId}`).emit("orderUpdate", orderPayload);

  if (order.courierId) {
    socket.to(`user:${order.courierId}`).emit("orderUpdate", orderPayload);
  }
};

const emitCartUpdate = (userId, cart) => {
  if (!userId) return;

  getIO().to(`user:${userId}`).emit("cart:update", {
    cart,
  });
};

const emitNotification = (notification) => {
  if (!notification?.userId) return;

  getIO().to(`user:${notification.userId}`).emit("notification", notification);
};

module.exports = {
  initializeSocket,
  getIO,
  emitOrderUpdate,
  emitCartUpdate,
  emitNotification,
};
