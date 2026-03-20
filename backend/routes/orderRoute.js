const express = require("express");
const { requireAuth } = require("../middleware/authMiddleware");

const {
  checkout,
  viewOrders,
  getOrderById,
} = require("../controllers/orderController");

const router = express.Router();

router.post("/checkout", requireAuth, checkout);
router.get("/me", requireAuth, viewOrders);
router.get("/:id", requireAuth, getOrderById);
router.get("/", requireAuth, viewOrders);

module.exports = router;
