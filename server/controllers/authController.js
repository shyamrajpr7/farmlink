const jwt = require("jsonwebtoken");
const User = require("../models/User");

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { name, email, phone, password, role, farmName, farmAddress, location } = req.body;

    if (!["farmer", "consumer"].includes(role)) {
      return res.status(400).json({ message: "Role must be farmer or consumer." });
    }

    const existing = await User.findOne({ email });
    if (existing) return res.status(409).json({ message: "Email already registered." });

    const user = await User.create({
      name, email, phone, password, role,
      ...(role === "farmer" && { farmName, farmAddress, location }),
    });

    const token = signToken(user._id);
    res.status(201).json({
      message: role === "farmer"
        ? "Farmer registered. Await admin verification before listing products."
        : "Consumer registered successfully.",
      token,
      user,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid email or password." });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: "Account deactivated. Contact support." });
    }
    const token = signToken(user._id);
    user.password = undefined;
    res.json({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/auth/me
const me = async (req, res) => {
  res.json({ user: req.user });
};

module.exports = { register, login, me };
