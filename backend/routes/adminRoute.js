const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getAdminDashboardStats,
  getAdminSalesAnalytics,
  getCompletedOrders,
  getAdminOrderById,
  getAllUsersWithStatus,
  getAdminUserById,
  updateOrderStatus,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/stats", adminMiddleware, getAdminDashboardStats);
router.get("/analytics", adminMiddleware, getAdminSalesAnalytics);
router.get("/orders", adminMiddleware, getCompletedOrders);
router.get("/orders/:id", adminMiddleware, getAdminOrderById);
router.patch("/orders/:id/status", adminMiddleware, updateOrderStatus);
router.get("/users", adminMiddleware, getAllUsersWithStatus);
router.get("/users/:id", adminMiddleware, getAdminUserById);

module.exports = router;

