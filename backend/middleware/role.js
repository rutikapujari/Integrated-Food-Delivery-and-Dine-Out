const authorize = (...roles) => {
  const allowedRoles = roles.flat().filter(Boolean);

  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Login required",
      });
    }

    if (allowedRoles.length && !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "You are not allowed to access this resource",
      });
    }

    next();
  };
};

const hasRole = (user, ...roles) => roles.flat().includes(user?.role);

module.exports = authorize;
module.exports.hasRole = hasRole;
