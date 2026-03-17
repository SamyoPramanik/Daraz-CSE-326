-- # Common SQL Queries for Daraz Backend

-- ============================================
-- 👥 USER OPERATIONS
-- ============================================

-- Get user by email
SELECT * FROM users WHERE email = $1;

-- Create new user
INSERT INTO users (name, email, password, phone) 
VALUES ($1, $2, $3, $4) 
RETURNING id, name, email, created_at;

-- Update user profile
UPDATE users 
SET name = $1, phone = $2 
WHERE id = $3 
RETURNING *;

-- ============================================
-- 🛍️ PRODUCT OPERATIONS
-- ============================================

-- Get all products with category
SELECT p.*, c.name as category_name 
FROM products p 
LEFT JOIN categories c ON p.category_id = c.id 
ORDER BY p.id;

-- Get products by category
SELECT * FROM products 
WHERE category_id = $1 
ORDER BY name;

-- Search products
SELECT * FROM products 
WHERE name ILIKE $1 OR brand ILIKE $1 
ORDER BY name;

-- Get flashsale products
SELECT * FROM products 
WHERE flash_sale = TRUE 
ORDER BY discount_price;

-- Get product with discount
SELECT id, name, price, discount_price, 
       ROUND((price - discount_price) / price * 100, 2) as discount_percent
FROM products 
WHERE id = $1;

-- Check stock availability
SELECT id, name, stock FROM products WHERE stock > 0;

-- Decrease product stock
UPDATE products 
SET stock = stock - $1 
WHERE id = $2 AND stock >= $1 
RETURNING stock;

-- ============================================
-- 🛒 CART OPERATIONS
-- ============================================

-- Get or create cart for user
INSERT INTO carts (user_id) 
VALUES ($1) 
ON CONFLICT (user_id) DO UPDATE SET user_id = $1 
RETURNING id;

-- Get cart items with product details
SELECT ci.id, ci.quantity, 
       p.id as product_id, p.name, p.price, p.discount_price, 
       p.stock
FROM cart_items ci 
INNER JOIN products p ON ci.product_id = p.id 
WHERE ci.cart_id = (
    SELECT id FROM carts WHERE user_id = $1
)
ORDER BY ci.id;

-- Add item to cart
INSERT INTO cart_items (cart_id, product_id, quantity) 
VALUES (
    (SELECT id FROM carts WHERE user_id = $1), 
    $2, 
    $3
)
ON CONFLICT (cart_id, product_id) DO UPDATE 
SET quantity = quantity + $3
RETURNING *;

-- Update cart item quantity
UPDATE cart_items 
SET quantity = $1 
WHERE id = $2 AND cart_id IN (
    SELECT id FROM carts WHERE user_id = $3
)
RETURNING *;

-- Remove item from cart
DELETE FROM cart_items 
WHERE id = $1 
AND cart_id IN (
    SELECT id FROM carts WHERE user_id = $2
)
RETURNING id;

-- Clear entire cart
DELETE FROM cart_items 
WHERE cart_id = (
    SELECT id FROM carts WHERE user_id = $1
);

-- Calculate cart total
SELECT 
    SUM(ci.quantity * COALESCE(p.discount_price, p.price)) as total
FROM cart_items ci 
INNER JOIN products p ON ci.product_id = p.id 
WHERE ci.cart_id = (
    SELECT id FROM carts WHERE user_id = $1
);

-- ============================================
-- 📋 ORDER OPERATIONS
-- ============================================

-- Create new order
INSERT INTO orders (user_id, total_amount, payment_method, payment_status, order_status, shipping_address) 
VALUES ($1, $2, $3, $4, $5, $6) 
RETURNING id, created_at;

-- Add order items from cart
INSERT INTO order_items (order_id, product_id, quantity, price)
SELECT $1, ci.product_id, ci.quantity, COALESCE(p.discount_price, p.price)
FROM cart_items ci 
INNER JOIN products p ON ci.product_id = p.id 
WHERE ci.cart_id = (
    SELECT id FROM carts WHERE user_id = $2
);

-- Get user orders
SELECT * FROM orders 
WHERE user_id = $1 
ORDER BY created_at DESC;

-- Get order details
SELECT 
    o.id, o.user_id, o.total_amount, 
    o.payment_method, o.payment_status, o.order_status, 
    o.shipping_address, o.created_at,
    u.name as user_name, u.email
FROM orders o 
INNER JOIN users u ON o.user_id = u.id 
WHERE o.id = $1;

-- Get order items
SELECT 
    oi.id, oi.quantity, oi.price,
    p.id as product_id, p.name, p.brand
FROM order_items oi 
INNER JOIN products p ON oi.product_id = p.id 
WHERE oi.order_id = $1;

-- Update order status
UPDATE orders 
SET order_status = $1 
WHERE id = $2 
RETURNING *;

-- Update payment status
UPDATE orders 
SET payment_status = $1 
WHERE id = $2 
RETURNING *;

-- ============================================
-- 📊 ANALYTICS & REPORTS
-- ============================================

-- Best selling products
SELECT 
    p.id, p.name, p.brand, 
    SUM(oi.quantity) as total_sold,
    SUM(oi.quantity * oi.price) as total_revenue
FROM order_items oi 
INNER JOIN products p ON oi.product_id = p.id 
INNER JOIN orders o ON oi.order_id = o.id 
WHERE o.payment_status = 'Paid'
GROUP BY p.id, p.name, p.brand 
ORDER BY total_sold DESC 
LIMIT 10;

-- Revenue by payment method
SELECT 
    payment_method,
    COUNT(*) as order_count,
    SUM(total_amount) as total_revenue
FROM orders 
WHERE payment_status = 'Paid'
GROUP BY payment_method;

-- Orders by status
SELECT 
    order_status,
    COUNT(*) as count,
    SUM(total_amount) as total_amount
FROM orders 
GROUP BY order_status;

-- User purchase history
SELECT 
    u.id, u.name, u.email,
    COUNT(o.id) as total_orders,
    SUM(o.total_amount) as total_spent
FROM users u 
LEFT JOIN orders o ON u.id = o.user_id 
GROUP BY u.id, u.name, u.email 
ORDER BY total_spent DESC;

-- ============================================
-- 🧹 MAINTENANCE QUERIES
-- ============================================

-- Check data integrity
SELECT p.id, p.name FROM products p 
WHERE category_id NOT IN (SELECT id FROM categories);

-- Find abandoned carts (no orders)
SELECT 
    u.id, u.email, 
    COUNT(ci.id) as items_in_cart
FROM carts c 
INNER JOIN users u ON c.user_id = u.id 
INNER JOIN cart_items ci ON c.id = ci.cart_id 
WHERE u.id NOT IN (SELECT DISTINCT user_id FROM orders)
GROUP BY u.id, u.email;

-- Orphaned cart items
SELECT * FROM cart_items 
WHERE cart_id NOT IN (SELECT id FROM carts);

-- Cascading delete (ON DELETE CASCADE)
-- When a user is deleted, all related carts and orders are automatically deleted
DELETE FROM users WHERE id = $1;

---

## Node.js / Express Example Usage

```javascript
const pool = require('./config/db');

// Get user by email
const user = await pool.query(
  'SELECT * FROM users WHERE email = $1', 
  ['user@example.com']
);

// Create order
const order = await pool.query(
  'INSERT INTO orders (user_id, total_amount, payment_method, payment_status, order_status, shipping_address) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
  [userId, 5000.00, 'bKash', 'Pending', 'Pending', 'Dhaka, Bangladesh']
);

// Parameterized queries prevent SQL injection
const result = await pool.query(
  'SELECT * FROM products WHERE category_id = $1',
  [categoryId]
);
```

## Important Notes

✅ Always use parameterized queries ($1, $2, etc.) to prevent SQL injection
✅ Use RETURNING clause to get inserted/updated data without extra queries
✅ Use ON CONFLICT for upsert operations
✅ Wrap multiple queries in transactions for data consistency
✅ Index foreign keys for better query performance
