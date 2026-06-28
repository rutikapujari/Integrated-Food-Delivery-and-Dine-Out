let io;

const initializeSocket = (server) => {
  const { Server } = require("socket.io");

  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ User Connected:", socket.id);

    // Join Order Room
    socket.on("joinOrder", (orderId) => {
      socket.join(orderId);
      console.log(`User joined order room: ${orderId}`);
    });

    // Leave Order Room
    socket.on("leaveOrder", (orderId) => {
      socket.leave(orderId);
      console.log(`User left order room: ${orderId}`);
    });

    socket.on("disconnect", () => {
      console.log("❌ User Disconnected:", socket.id);
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

module.exports = {
  initializeSocket,
  getIO,
};