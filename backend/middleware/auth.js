const jwt = require("jsonwebtoken");
const User = require("../models/User");

const getTokenFromRequest = (req) => {
  const authHeader = req.headers.authorization || "";

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.split(" ")[1];
  }

  return (
    req.headers["x-auth-token"] ||
    req.cookies?.accessToken ||
    req.cookies?.token ||
    req.body?.token ||
    req.query?.token ||
    null
  );
};

const auth = async (req, res, next) => {
  try {
    if (!process.env.JWT_SECRET) {
      return res.status(500).json({
        success: false,
        message: "JWT_SECRET is not configured",
      });
    }

    const token = getTokenFromRequest(req);

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Authentication token is required. Login first or send Authorization: Bearer <token>",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User no longer exists",
      });
    }

    if (user.isActive === false) {
      return res.status(403).json({
        success: false,
        message: "User account is inactive",
      });
    }

    req.user = user;
    req.userId = user._id;
    req.userRole = user.role;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

module.exports = auth;
module.exports.getTokenFromRequest = getTokenFromRequest;
