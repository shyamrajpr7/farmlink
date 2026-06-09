const mongoose = require("mongoose");
const { customAlphabet } = require("nanoid");

const nanoid = customAlphabet("0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ", 6);

const orderSchema = new mongoose.Schema(
  {
    consumer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    product: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    quantity: { type: Number, required: true, min: 1 },
    pricePerUnit: { type: Number, required: true },
    totalAmount: { type: Number, required: true },

    // ── ORDER STATUS ──────────────────────────────────────────────
    status: {
      type: String,
      enum: [
        "pending",       // consumer placed order, awaiting farmer acceptance
        "accepted",      // farmer accepted
        "ready",         // farmer marked as ready for pickup/delivery
        "in_transit",    // farmer-arranged or courier in transit
        "delivered",     // farmer marks delivered, awaiting consumer PIN
        "completed",     // consumer confirmed with PIN — escrow released
        "cancelled",
        "disputed",
      ],
      default: "pending",
    },

    // ── LOGISTICS PHASE ──────────────────────────────────────────
    deliveryMode: {
      type: String,
      enum: ["self_pickup", "farmer_delivery", "enterprise_courier"],
      required: true,
    },

    // Phase 1 — manual verification codes
    pickupCode: { type: String },      // shown to consumer for self-pickup
    confirmationPin: { type: String }, // consumer shares with farmer to close order

    // Phase 2 — enterprise courier (future / logistics switch)
    courierProvider: { type: String },         // "ekart" | "amazon"
    courierTrackingId: { type: String },
    courierShippingLabel: { type: String },    // label URL
    courierPickupRequestedAt: { type: Date },

    // ── ESCROW ───────────────────────────────────────────────────
    paymentStatus: {
      type: String,
      enum: ["pending", "held", "released", "refunded"],
      default: "pending",
    },
    paymentReference: { type: String }, // gateway transaction ID

    // ── METADATA ─────────────────────────────────────────────────
    deliveryAddress: { type: String },
    notes: { type: String },
    completedAt: { type: Date },
    cancelledAt: { type: Date },
    cancelReason: { type: String },
  },
  { timestamps: true }
);

// Auto-generate pickup code and confirmation PIN before save
orderSchema.pre("save", function (next) {
  if (this.isNew) {
    this.pickupCode = nanoid();
    this.confirmationPin = nanoid();
  }
  next();
});

module.exports = mongoose.model("Order", orderSchema);
