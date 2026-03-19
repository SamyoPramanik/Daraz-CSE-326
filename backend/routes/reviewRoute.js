const express = require('express');
const { getProductReviews, createReview, deleteReview } = require('../controllers/reviewController');
const { requireAuth } = require('../middleware/authMiddleware');

const router = express.Router();

// Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Create new review or update existing
router.post('/', requireAuth, createReview);

// Delete review
router.delete('/:reviewId', requireAuth, deleteReview);

module.exports = router;
