const pool = require('../config/db');
const crypto = require('crypto');



const getUserCartId = (userId) => {
    const hash = crypto.createHash('md5').update(userId).digest('hex').slice(0, 8);
    const num = parseInt(hash, 16);
    return num % 2147483647;
};

const viewCart = async (req, res) => {
    try {
        const cartId = getUserCartId(req.user.id);

        const result = await pool.query(
            `SELECT
                ci.id,
                ci.cart_id,
                ci.product_id,
                p.name,
                p.image_url,
                p.price,
                p.discount_price,
                ci.quantity,
                (ci.quantity * COALESCE(p.discount_price, p.price))::numeric(12,2) AS total_price
            FROM cart_items ci
            JOIN products p ON p.id = ci.product_id
            WHERE ci.cart_id = $1
            ORDER BY ci.id DESC`,
            [cartId]
        );

        const cartTotal = result.rows.reduce((sum, item) => {
            return sum + parseFloat(item.total_price);
        }, 0);

        const normalizedItems = result.rows.map((item) => ({
            ...item,
            price: Number(item.price),
            discount_price: item.discount_price !== null ? Number(item.discount_price) : null,
            total_price: Number(item.total_price)
        }));

        res.json({
            status: 'success',
            data: normalizedItems,
            meta: {
                cart_total: Number(cartTotal.toFixed(2))
            }
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to retrieve cart',
            error: error.message
        });
    }
};

const addProduct = async (req, res) => {
    try {
        const { productId, quantity = 1 } = req.body;

        if (!productId || quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'productId and a valid quantity are required'
            });
        }

        const cartId = getUserCartId(req.user.id);

        const productResult = await pool.query(
            'SELECT id, stock FROM products WHERE id = $1',
            [productId]
        );

        if (productResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Product not found'
            });
        }

        const product = productResult.rows[0];

        const existingItemResult = await pool.query(
            'SELECT id, quantity FROM cart_items WHERE cart_id = $1 AND product_id = $2',
            [cartId, productId]
        );

        let updatedItem;

        if (existingItemResult.rows.length > 0) {
            const existingItem = existingItemResult.rows[0];
            const newQty = existingItem.quantity + Number(quantity);

            if (newQty > product.stock) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Requested quantity exceeds available stock'
                });
            }

            const updateResult = await pool.query(
                `UPDATE cart_items
                 SET quantity = $1
                 WHERE id = $2
                 RETURNING id, product_id, quantity`,
                [newQty, existingItem.id]
            );
            updatedItem = updateResult.rows[0];
        } else {
            if (Number(quantity) > product.stock) {
                return res.status(400).json({
                    status: 'error',
                    message: 'Requested quantity exceeds available stock'
                });
            }

            const insertResult = await pool.query(
                `INSERT INTO cart_items (cart_id, product_id, quantity)
                 VALUES ($1, $2, $3)
                 RETURNING id, product_id, quantity`,
                [cartId, productId, quantity]
            );
            updatedItem = insertResult.rows[0];
        }

        res.status(201).json({
            status: 'success',
            message: 'Product added to cart',
            data: updatedItem
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to add product to cart',
            error: error.message
        });
    }
};

const updateCart = async (req, res) => {
    try {
        const { id } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({
                status: 'error',
                message: 'quantity must be at least 1'
            });
        }

        const cartId = getUserCartId(req.user.id);

        const cartItemResult = await pool.query(
            `SELECT ci.id, ci.product_id, p.stock
             FROM cart_items ci
             JOIN products p ON p.id = ci.product_id
             WHERE ci.id = $1 AND ci.cart_id = $2`,
            [id, cartId]
        );

        if (cartItemResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart item not found'
            });
        }

        const cartItem = cartItemResult.rows[0];
        if (Number(quantity) > cartItem.stock) {
            return res.status(400).json({
                status: 'error',
                message: 'Requested quantity exceeds available stock'
            });
        }

        const updateResult = await pool.query(
            `UPDATE cart_items
             SET quantity = $1
             WHERE id = $2
             RETURNING id, product_id, quantity`,
            [quantity, id]
        );

        res.json({
            status: 'success',
            message: 'Cart quantity updated',
            data: updateResult.rows[0]
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to update cart',
            error: error.message
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { id } = req.params;
        const cartId = getUserCartId(req.user.id);

        const deleteResult = await pool.query(
            'DELETE FROM cart_items WHERE id = $1 AND cart_id = $2 RETURNING id',
            [id, cartId]
        );

        if (deleteResult.rows.length === 0) {
            return res.status(404).json({
                status: 'error',
                message: 'Cart item not found'
            });
        }

        res.json({
            status: 'success',
            message: 'Item removed from cart'
        });
    } catch (error) {
        res.status(500).json({
            status: 'error',
            message: 'Failed to remove item from cart',
            error: error.message
        });
    }
};  



module.exports = {
    viewCart,
    addProduct,
    updateCart,
    removeFromCart
};