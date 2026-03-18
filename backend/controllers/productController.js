const pool = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM products');
        res.json({
            status: 'success',
            data: result.rows,
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve products',
            error: err.message
        });
    }
};

// Get single product with reviews
const getProductWithReviews = async (req, res) => {
    try {
        const { id } = req.params;

        // Get product details
        const productResult = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        const product = productResult.rows[0];

        // Get product reviews with user info
        const reviewsResult = await pool.query(
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
            [id]
        );

        // Get average rating
        const ratingResult = await pool.query(
            `SELECT 
                ROUND(AVG(oi.rating), 2) as avg_rating,
                COUNT(oi.id) as review_count
            FROM order_items oi
            WHERE oi.product_id = $1 AND oi.rating IS NOT NULL`,
            [id]
        );

        const { avg_rating, review_count } = ratingResult.rows[0];

        // Combine all data
        const response = {
            status: 'success',
            data: {
                ...product,
                rating: {
                    avg: avg_rating || 0,
                    total_reviews: review_count || 0
                },
                reviews: reviewsResult.rows
            }
        };

        res.json(response);
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve product details',
            error: err.message
        });
    }
};

module.exports = {
    getProducts,
    getProductWithReviews,
};
