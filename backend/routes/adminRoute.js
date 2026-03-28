const express = require("express");
const adminMiddleware = require("../middleware/adminMiddleware");
const {
  getCompletedOrders,
  getAdminOrderById,
  getAllUsersWithStatus,
  getAdminUserById,
} = require("../controllers/adminController");

const router = express.Router();

router.get("/orders", adminMiddleware, getCompletedOrders);
router.get("/orders/:id", adminMiddleware, getAdminOrderById);
router.get("/users", adminMiddleware, getAllUsersWithStatus);
router.get("/users/:id", adminMiddleware, getAdminUserById);

module.exports = router;
