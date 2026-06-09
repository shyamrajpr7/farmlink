const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ["vegetables", "fruits", "grains", "dairy", "poultry", "other"],
      required: true,
    },
    description: { type: String },
    pricePerUnit: { type: Number, required: true, min: 0 },
    unit: { type: String, enum: ["kg", "g", "litre", "piece", "dozen"], required: true },
    quantityAvailable: { type: Number, required: true, min: 0 },
    images: [{ type: String }], // image URLs
    isAvailable: { type: Boolean, default: true },

    // Geolocation copied from farmer for fast nearby queries
    location: {
      type: { type: String, enum: ["Point"], default: "Point" },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

productSchema.index({ location: "2dsphere" });
productSchema.index({ category: 1, isAvailable: 1 });

module.exports = mongoose.model("Product", productSchema);
