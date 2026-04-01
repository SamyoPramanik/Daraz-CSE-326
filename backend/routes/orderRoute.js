const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  checkout,
  viewOrders,
  getOrderById,
  paymentSuccess,
  paymentFail,
  paymentCancel,
  paymentIPN,
} = require("../controllers/orderController");

const router = express.Router();

// SSLCommerz payment callback routes (no auth — SSLCommerz calls these directly)
router.post("/payment/success", paymentSuccess);
router.post("/payment/fail", paymentFail);
router.post("/payment/cancel", paymentCancel);
router.post("/payment/ipn", paymentIPN);

// Authenticated order routes
router.post("/checkout", requireAuth, checkout);
router.get("/me", requireAuth, viewOrders);
router.get("/:id", requireAuth, getOrderById);
router.get("/", requireAuth, viewOrders);

module.exports = router;
