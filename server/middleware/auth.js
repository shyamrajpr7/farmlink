const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verify JWT and attach user to request
const protect = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Not authorised. No token." });
    }
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
    if (!req.user || !req.user.isActive) {
      return res.status(401).json({ message: "User not found or deactivated." });
    }
    next();
  } catch {
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

// Role guard — usage: authorise("admin") or authorise("farmer", "admin")
const authorise = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({
      message: `Access denied. Required role: ${roles.join(" or ")}.`,
    });
  }
  next();
};

// Farmers must be verified by admin before they can post products
const requireVerified = (req, res, next) => {
  if (req.user.role === "farmer" && !req.user.isVerified) {
    return res.status(403).json({
      message: "Your farmer account is pending admin verification.",
    });
  }
  next();
};

module.exports = { protect, authorise, requireVerified };
