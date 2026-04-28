const allowRoles = (...roles) => {
  return (req, res, next) => {
    // ❌ No user (token not verified)
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized: Please login first",
      });
    }

    // ❌ Role not allowed
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: "Access denied",
      });
    }

    next();
  };
};

module.exports = { allowRoles };