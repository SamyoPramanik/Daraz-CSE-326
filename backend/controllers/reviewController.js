const pool = require('../config/db');

// Get all reviews for a product
const getProductReviews = async (req, res) => {
    try {
        const { productId } = req.params;

        const result = await pool.query(
            `SELECT 
                r.id,
                r.rating,
                r.review,
                r.created_at,
                u.name as user_name,
                u.email
            FROM reviews r
            JOIN users u ON r.user_id = u.id
            WHERE r.product_id = $1
            ORDER BY r.created_at DESC`,
            [productId]
        );

        const ratingResult = await pool.query(
            `SELECT 
                ROUND(AVG(r.rating), 2) as avg_rating,
                COUNT(r.id) as review_count
            FROM reviews r
            WHERE r.product_id = $1`,
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

        // Check if product exists
        const productCheck = await pool.query(
            'SELECT id FROM products WHERE id = $1',
            [productId]
        );

        if (productCheck.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        // Insert or update review
        const result = await pool.query(
            `INSERT INTO reviews (user_id, product_id, rating, review)
            VALUES ($1, $2, $3, $4)
            ON CONFLICT (user_id, product_id)
            DO UPDATE SET rating = $3, review = $4, created_at = NOW()
            RETURNING *`,
            [userId, productId, rating, review || null]
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
            'SELECT id FROM reviews WHERE id = $1 AND user_id = $2',
            [reviewId, userId]
        );

        if (checkResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Review not found or you do not have permission to delete'
            });
        }

        // Delete review
        await pool.query(
            'DELETE FROM reviews WHERE id = $1',
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
