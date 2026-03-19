const pool = require('../config/db');

const getProducts = async (req, res) => {
    try {
        const {
            page = 1,
            limit = 20,
            flash_sale,
            trending,
            category,
            search,
            sort
        } = req.query;

        const offset = (page - 1) * limit;
        const params = [];
        let paramCount = 1;

        let query = `
            SELECT 
                p.id,
                p.name,
                p.image_url,
                p.price,
                p.discount_price,
                p.flash_sale,
                p.category_id,
                c.name as category_name,
                ROUND(AVG(oi.rating), 2) as rating
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id AND oi.rating IS NOT NULL
            WHERE 1=1
        `;

        if (search) {
            query += ` AND p.name ILIKE $${paramCount}`;
            params.push(`%${search}%`);
            paramCount++;
        }

        if (flash_sale === 'true') {
            query += ` AND p.flash_sale = TRUE`;
        }

        if (category) {
            const categoryIds = category.split(',').map(c => parseInt(c.trim())).filter(id => !isNaN(id));
            if (categoryIds.length > 0) {
                query += ` AND p.category_id = ANY($${paramCount}::int[])`;
                params.push(categoryIds);
                paramCount++;
            }
        }

        query += ` GROUP BY p.id, p.name, p.image_url, p.price, p.discount_price, p.flash_sale, p.category_id, c.name`;

        if (trending === 'true') {
            query += ` ORDER BY rating DESC NULLS LAST`;
        } else {
            switch (sort) {
                case 'price_asc': query += ` ORDER BY p.price ASC`; break;
                case 'price_desc': query += ` ORDER BY p.price DESC`; break;
                case 'rating_desc': query += ` ORDER BY rating DESC NULLS LAST`; break;
                default: query += ` ORDER BY p.name ASC`;
            }
        }

        query += ` LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
        params.push(limit, offset);

        let countQuery = `
            SELECT COUNT(DISTINCT p.id) 
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            WHERE 1=1
        `;
        const countParams = [];
        let countParamCount = 1;

        if (search) {
            countQuery += ` AND p.name ILIKE $${countParamCount}`;
            countParams.push(`%${search}%`);
            countParamCount++;
        }
        if (flash_sale === 'true') countQuery += ` AND p.flash_sale = TRUE`;
        if (category) {
            const categoryIds = category.split(',').map(c => parseInt(c.trim())).filter(id => !isNaN(id));
            if (categoryIds.length > 0) {
                countQuery += ` AND p.category_id = ANY($${countParamCount}::int[])`;
                countParams.push(categoryIds);
            }
        }

        const [result, countResult] = await Promise.all([
            pool.query(query, params),
            pool.query(countQuery, countParams)
        ]);

        const total_items = parseInt(countResult.rows[0].count);

        res.json({
            status: 'success',
            data: result.rows,
            meta: {
                total_items,
                total_pages: Math.ceil(total_items / limit),
                current_page: parseInt(page),
                limit: parseInt(limit)
            }
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

const getProductCategories = async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name FROM categories ORDER BY name'
        );

        res.json({
            status: 'success',
            data: result.rows.map(row => ({ id: row.id, name: row.name }))
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve categories',
            error: err.message
        });
    }
};

const getTrendingProducts = async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT 
                p.id,
                p.name,
                p.image_url,
                p.price,
                p.discount_price,
                p.flash_sale,
                p.category_id,
                c.name as category_name,
                ROUND(AVG(oi.rating), 2) as rating
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            LEFT JOIN order_items oi ON p.id = oi.product_id AND oi.rating IS NOT NULL
            GROUP BY p.id, p.name, p.image_url, p.price, p.discount_price, p.flash_sale, p.category_id, c.name
            ORDER BY rating DESC NULLS LAST
            LIMIT 10`
        );

        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve trending products',
            error: err.message
        });
    }
};

module.exports = {
    getProducts,
    getProductWithReviews,
    getProductCategories,
    getTrendingProducts
};
