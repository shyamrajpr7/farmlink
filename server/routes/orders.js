const express = require("express");
const router = express.Router();
const {
  placeOrder, myOrders, farmOrders,
  acceptOrder, markReady, markDelivered, completeOrder, cancelOrder,
} = require("../controllers/orderController");
const { protect, authorise } = require("../middleware/auth");

router.post("/", protect, authorise("consumer"), placeOrder);
router.get("/my", protect, authorise("consumer"), myOrders);
router.get("/farm", protect, authorise("farmer"), farmOrders);
router.patch("/:id/accept", protect, authorise("farmer"), acceptOrder);
router.patch("/:id/ready", protect, authorise("farmer"), markReady);
router.patch("/:id/deliver", protect, authorise("farmer"), markDelivered);
router.patch("/:id/complete", protect, authorise("farmer"), completeOrder);
router.patch("/:id/cancel", protect, cancelOrder);

module.exports = router;
