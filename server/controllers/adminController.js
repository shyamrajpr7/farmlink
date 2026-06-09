const User = require("../models/User");
const Product = require("../models/Product");
const Order = require("../models/Order");

// GET /api/admin/dashboard — platform-wide stats
const getDashboard = async (req, res) => {
  try {
    const [
      totalFarmers, pendingFarmers, totalConsumers,
      totalOrders, activeOrders, completedOrders,
      totalProducts, totalRevenue,
    ] = await Promise.all([
      User.countDocuments({ role: "farmer" }),
      User.countDocuments({ role: "farmer", isVerified: false }),
      User.countDocuments({ role: "consumer" }),
      Order.countDocuments(),
      Order.countDocuments({ status: { $in: ["pending", "accepted", "ready", "in_transit", "delivered"] } }),
      Order.countDocuments({ status: "completed" }),
      Product.countDocuments({ isAvailable: true }),
      Order.aggregate([
        { $match: { paymentStatus: "released" } },
        { $group: { _id: null, total: { $sum: "$totalAmount" } } },
      ]),
    ]);

    const revenueValue = totalRevenue[0]?.total || 0;

    // Recent orders feed
    const recentOrders = await Order.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .populate("consumer", "name")
      .populate("farmer", "name farmName")
      .populate("product", "name");

    res.json({
      stats: {
        totalFarmers, pendingFarmers, totalConsumers,
        totalOrders, activeOrders, completedOrders,
        totalProducts,
        totalRevenuePaised: revenueValue,
        logisticsEnterpriseEnabled: process.env.LOGISTICS_ENTERPRISE_ENABLED === "true",
      },
      recentOrders,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/farmers — list all farmers with verification status
const getFarmers = async (req, res) => {
  try {
    const { verified } = req.query;
    const filter = { role: "farmer" };
    if (verified !== undefined) filter.isVerified = verified === "true";
    const farmers = await User.find(filter).sort({ createdAt: -1 });
    res.json({ farmers });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/farmers/:id/verify — approve a farmer
const verifyFarmer = async (req, res) => {
  try {
    const farmer = await User.findOneAndUpdate(
      { _id: req.params.id, role: "farmer" },
      { isVerified: true },
      { new: true }
    );
    if (!farmer) return res.status(404).json({ message: "Farmer not found." });
    res.json({ message: `${farmer.name} verified successfully.`, farmer });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/users/:id/toggle — activate or deactivate any user
const toggleUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found." });
    user.isActive = !user.isActive;
    await user.save();
    res.json({ message: `User ${user.isActive ? "activated" : "deactivated"}.`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/orders — all orders with filters
const getAllOrders = async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query;
    const filter = status ? { status } : {};
    const orders = await Order.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("consumer", "name phone")
      .populate("farmer", "name farmName")
      .populate("product", "name unit");
    const total = await Order.countDocuments(filter);
    res.json({ orders, total, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/admin/orders/:id/dispute — flag an order as disputed
const disputeOrder = async (req, res) => {
  try {
    const order = await Order.findByIdAndUpdate(
      req.params.id,
      { status: "disputed" },
      { new: true }
    );
    if (!order) return res.status(404).json({ message: "Order not found." });
    res.json({ message: "Order flagged as disputed.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/admin/logistics/status — show current logistics switch state
const logisticsStatus = async (req, res) => {
  res.json({
    logisticsEnterpriseEnabled: process.env.LOGISTICS_ENTERPRISE_ENABLED === "true",
    availableModes: [
      "self_pickup",
      "farmer_delivery",
      ...(process.env.LOGISTICS_ENTERPRISE_ENABLED === "true" ? ["enterprise_courier"] : []),
    ],
    note: process.env.LOGISTICS_ENTERPRISE_ENABLED !== "true"
      ? "Set LOGISTICS_ENTERPRISE_ENABLED=true in .env to activate Phase 2 courier integration."
      : "Enterprise courier active. Ekart/Amazon APIs are live.",
  });
};

module.exports = {
  getDashboard, getFarmers, verifyFarmer,
  toggleUser, getAllOrders, disputeOrder, logisticsStatus,
};
