const express = require("express");
const router = express.Router();
const {
  getDashboard, getFarmers, verifyFarmer,
  toggleUser, getAllOrders, disputeOrder, logisticsStatus,
} = require("../controllers/adminController");
const { protect, authorise } = require("../middleware/auth");

const adminOnly = [protect, authorise("admin")];

router.get("/dashboard", ...adminOnly, getDashboard);
router.get("/farmers", ...adminOnly, getFarmers);
router.patch("/farmers/:id/verify", ...adminOnly, verifyFarmer);
router.patch("/users/:id/toggle", ...adminOnly, toggleUser);
router.get("/orders", ...adminOnly, getAllOrders);
router.patch("/orders/:id/dispute", ...adminOnly, disputeOrder);
router.get("/logistics/status", ...adminOnly, logisticsStatus);

module.exports = router;
