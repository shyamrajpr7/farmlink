const Product = require("../models/Product");
const User = require("../models/User");

// GET /api/products — browse marketplace (consumers)
// Query params: lat, lng, radius (km), category, page, limit
const getProducts = async (req, res) => {
  try {
    const { lat, lng, radius = 50, category, page = 1, limit = 20 } = req.query;
    const filter = { isAvailable: true, quantityAvailable: { $gt: 0 } };
    if (category) filter.category = category;

    let query;
    if (lat && lng) {
      query = Product.find({
        ...filter,
        location: {
          $near: {
            $geometry: { type: "Point", coordinates: [parseFloat(lng), parseFloat(lat)] },
            $maxDistance: parseFloat(radius) * 1000,
          },
        },
      });
    } else {
      query = Product.find(filter).sort({ createdAt: -1 });
    }

    const products = await query
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .populate("farmer", "name farmName farmAddress phone location");

    res.json({ products, page: parseInt(page) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/:id
const getProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate(
      "farmer", "name farmName farmAddress phone location"
    );
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST /api/products — farmer creates listing
const createProduct = async (req, res) => {
  try {
    const farmer = await User.findById(req.user._id);
    const product = await Product.create({
      ...req.body,
      farmer: req.user._id,
      location: farmer.location, // inherit farm geolocation
    });
    res.status(201).json({ message: "Product listed successfully.", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT /api/products/:id — farmer updates listing
const updateProduct = async (req, res) => {
  try {
    const product = await Product.findOne({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found or not yours." });
    Object.assign(product, req.body);
    await product.save();
    res.json({ message: "Product updated.", product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE /api/products/:id — farmer removes listing
const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ _id: req.params.id, farmer: req.user._id });
    if (!product) return res.status(404).json({ message: "Product not found or not yours." });
    res.json({ message: "Product removed." });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET /api/products/my — farmer sees their own listings
const myProducts = async (req, res) => {
  try {
    const products = await Product.find({ farmer: req.user._id }).sort({ createdAt: -1 });
    res.json({ products });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getProducts, getProduct, createProduct, updateProduct, deleteProduct, myProducts };
