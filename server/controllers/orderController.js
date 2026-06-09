const Order = require("../models/Order");
const Product = require("../models/Product");

// ── LOGISTICS SWITCH ─────────────────────────────────────────────────────────
// When LOGISTICS_ENTERPRISE_ENABLED=true, Phase 2 courier APIs are available.
// Phase 1 (self_pickup / farmer_delivery) always remains available as fallback.
const enterpriseEnabled = () => process.env.LOGISTICS_ENTERPRISE_ENABLED === "true";

// Phase 2 stub — replace with real Ekart/Amazon SDK calls when switching on
const requestEnterpriseCourier = async (order, provider) => {
  // TODO: integrate Ekart or Amazon Logistics SDK here
  // Should return { trackingId, shippingLabel, estimatedPickup }
  console.log(`[LOGISTICS SWITCH] Enterprise courier requested: ${provider}`);
  return {
    trackingId: `${provider.toUpperCase()}-DEMO-${Date.now()}`,
    shippingLabel: `https://labels.${provider}.com/demo`,
  };
};
// ─────────────────────────────────────────────────────────────────────────────

// POST /api/orders — consumer places order
const placeOrder = async (req, res) => {
  try {
    const { productId, quantity, deliveryMode, deliveryAddress, notes } = req.body;
    const product = await Product.findById(productId).populate("farmer");

    if (!product || !product.isAvailable) {
      return res.status(404).json({ message: "Product not available." });
    }
    if (product.quantityAvailable < quantity) {
      return res.status(400).json({
        message: `Only ${product.quantityAvailable} ${product.unit} available.`,
      });
    }

    // Validate delivery mode against logistics switch
    if (deliveryMode === "enterprise_courier" && !enterpriseEnabled()) {
      return res.status(400).json({
        message: "Enterprise courier is not yet active. Choose self_pickup or farmer_delivery.",
      });
    }

    const totalAmount = product.pricePerUnit * quantity;
    const order = await Order.create({
      consumer: req.user._id,
      farmer: product.farmer._id,
      product: productId,
      quantity,
      pricePerUnit: product.pricePerUnit,
      totalAmount,
      deliveryMode,
      deliveryAddress,
      notes,
      paymentStatus: "held", // escrow: payment held on order creation
    });

    // Reduce available stock
    product.quantityAvailable -= quantity;
    if (product.quantityAvailable === 0) product.isAvailable = false;
    await product.save();

    // If enterprise courier requested, trigger API (Phase 2)
    if (deliveryMode === "enterprise_courier") {
      const provider = req.body.courierProvider || "ekart";
      const courierData = await requestEnterpriseCourier(order, provider);
      order.courierProvider = provider;
      order.courierTrackingId = courierData.trackingId;
      order.courierShippingLabel = courierData.shippingLabel;
      order.courierPickupRequestedAt = new Date();
      order.status = "accepted";
      await order.save();
    }

    await order.populate([
      { path: "product", select: "name unit" },
      { path: "farmer", select: "name farmName phone" },
    ]);

    res.status(201).json({
      message: "Order placed. Payment held in escrow.",
      order,
      // Phase 1: give consumer the codes they need
      ...(deliveryMode === "self_pickup" && { pickupCode: order.pickupCode }),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/my — consumer sees their orders
const myOrders = async (req, res) => {
  try {
    const orders = await Order.find({ consumer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("product", "name unit images")
      .populate("farmer", "name farmName phone");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/orders/farm — farmer sees incoming orders
const farmOrders = async (req, res) => {
  try {
    const orders = await Order.find({ farmer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("product", "name unit")
      .populate("consumer", "name phone deliveryAddress");
    res.json({ orders });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/accept — farmer accepts order
const acceptOrder = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (order.status !== "pending") return res.status(400).json({ message: "Order already processed." });
    order.status = "accepted";
    await order.save();
    res.json({ message: "Order accepted.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/ready — farmer marks order ready
const markReady = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!order || order.status !== "accepted") {
      return res.status(400).json({ message: "Order must be accepted first." });
    }
    order.status = "ready";
    await order.save();
    res.json({ message: "Order marked as ready.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/deliver — farmer marks as delivered, requests PIN from consumer
const markDelivered = async (req, res) => {
  try {
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!order || !["ready", "in_transit"].includes(order.status)) {
      return res.status(400).json({ message: "Cannot mark as delivered at this stage." });
    }
    order.status = "delivered";
    await order.save();
    res.json({
      message: "Marked as delivered. Ask the consumer for their confirmation PIN to complete the order.",
      order,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/complete — farmer submits consumer PIN → escrow released
const completeOrder = async (req, res) => {
  try {
    const { confirmationPin } = req.body;
    const order = await Order.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!order || order.status !== "delivered") {
      return res.status(400).json({ message: "Order must be in delivered status." });
    }
    if (order.confirmationPin !== confirmationPin) {
      return res.status(400).json({ message: "Invalid confirmation PIN." });
    }
    order.status = "completed";
    order.paymentStatus = "released"; // escrow released to farmer
    order.completedAt = new Date();
    await order.save();
    res.json({ message: "Order completed. Payment released to farmer.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PATCH /api/orders/:id/cancel — cancel order (consumer or farmer)
const cancelOrder = async (req, res) => {
  try {
    const { reason } = req.body;
    const query =
      req.user.role === "consumer"
        ? { _id: req.params.id, consumer: req.user._id }
        : { _id: req.params.id, farmer: req.user._id };
    const order = await Order.findOne(query);
    if (!order) return res.status(404).json({ message: "Order not found." });
    if (["completed", "cancelled"].includes(order.status)) {
      return res.status(400).json({ message: "Order is already finalised." });
    }
    order.status = "cancelled";
    order.paymentStatus = "refunded";
    order.cancelReason = reason;
    order.cancelledAt = new Date();
    // Restore stock
    await Product.findByIdAndUpdate(order.product, {
      $inc: { quantityAvailable: order.quantity },
      isAvailable: true,
    });
    await order.save();
    res.json({ message: "Order cancelled. Payment refunded.", order });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  placeOrder, myOrders, farmOrders,
  acceptOrder, markReady, markDelivered, completeOrder, cancelOrder,
};
