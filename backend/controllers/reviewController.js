const pool = require('../config/db');

// Get all reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await pool.query(
            `SELECT 
                oi.id,
                oi.rating,
                oi.review,
                oi.review_date as created_at,
                u.name as user_name,
                u.email
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            JOIN users u ON o.user_id = u.id
            WHERE oi.product_id = $1 AND oi.rating IS NOT NULL
            ORDER BY oi.review_date DESC`,
            [productId]
        );

        const ratingResult = await pool.query(
            `SELECT 
                ROUND(AVG(oi.rating), 2) as avg_rating,
                COUNT(oi.id) as review_count
            FROM order_items oi
            WHERE oi.product_id = $1 AND oi.rating IS NOT NULL`,
            [productId]
        );

        const { avg_rating, review_count } = ratingResult.rows[0];

        res.json({
            status: 'success',
            data: {
                product_id: productId,
                rating: {
                    avg: avg_rating || 0,
                    total_reviews: review_count || 0
                },
                reviews: result.rows
            }
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve reviews',
            error: err.message
        });
    }
};

// Create or update review
const createReview = async (req, res) => {
    try {
        const { userId, productId, rating, review } = req.body;

        // Validate rating
        if (!rating || rating < 1 || rating > 5) {
            return res.status(400).json({
                status: 'error',
                message: 'Rating must be between 1 and 5'
            });
        }

        // Check if user has ordered the product
        const orderItemCheck = await pool.query(
            `SELECT oi.id 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE o.user_id = $1 AND oi.product_id = $2
             LIMIT 1`,
            [userId, productId]
        );

        if (orderItemCheck.rows.length === 0) {
            return res.status(403).json({
                status: 'error',
                message: 'You can only review products you have ordered'
            });
        }

        const orderItemId = orderItemCheck.rows[0].id;

        // Update order_item with review
        const result = await pool.query(
            `UPDATE order_items 
             SET rating = $1, review = $2, review_date = NOW()
             WHERE id = $3
             RETURNING *`,
            [rating, review || null, orderItemId]
        );

        res.status(201).json({
            status: 'success',
            message: 'Review created/updated successfully',
            data: result.rows[0]
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to create review',
            error: err.message
        });
    }
};

// Delete review
const deleteReview = async (req, res) => {
    try {
        const { reviewId } = req.params;
        const { userId } = req.body;

        // Check if review exists and belongs to user
        const checkResult = await pool.query(
            `SELECT oi.id 
             FROM order_items oi
             JOIN orders o ON oi.order_id = o.id
             WHERE oi.id = $1 AND o.user_id = $2`,
            [reviewId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Review not found or you do not have permission to delete'
            });
        }

        // Delete review (clear rating and review data from order_item)
        await pool.query(
            `UPDATE order_items 
             SET rating = NULL, review = NULL, review_date = NULL
             WHERE id = $1`,
            [reviewId]
        );

        res.json({
            status: 'success',
            message: 'Review deleted successfully'
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to delete review',
            error: err.message
        });
    }
};

module.exports = {
    getProductReviews,
    createReview,
    deleteReview
};
