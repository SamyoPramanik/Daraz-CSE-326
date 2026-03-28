const express = require("express");
const router = express.Router();
const { getProductReliabilityScore } = require("../controllers/aiController");

// GET reliability score for a product (public endpoint - no auth required)
router.get("/reliability/:productId", getProductReliabilityScore);

module.exports = router;
