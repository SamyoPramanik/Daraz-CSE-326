const express = require('express');
const { getProductReviews, createReview, deleteReview } = require('../controllers/reviewController');

const router = express.Router();

// Get all reviews for a product
router.get('/product/:productId', getProductReviews);

// Create new review or update existing
router.post('/', createReview);

// Delete review
router.delete('/:reviewId', deleteReview);

module.exports = router;
