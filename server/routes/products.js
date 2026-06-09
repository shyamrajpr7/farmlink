const express = require("express");
const router = express.Router();
const {
  getProducts, getProduct, createProduct,
  updateProduct, deleteProduct, myProducts,
} = require("../controllers/productController");
const { protect, authorise, requireVerified } = require("../middleware/auth");

router.get("/", getProducts);
router.get("/my", protect, authorise("farmer"), myProducts);
router.get("/:id", getProduct);
router.post("/", protect, authorise("farmer"), requireVerified, createProduct);
router.put("/:id", protect, authorise("farmer"), requireVerified, updateProduct);
router.delete("/:id", protect, authorise("farmer"), deleteProduct);

module.exports = router;
