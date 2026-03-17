-- Seed data for Daraz eCommerce Platform

-- Insert Categories
INSERT INTO categories (name) VALUES
    ('Electronics'),
    ('Clothing'),
    ('Home & Kitchen'),
    ('Books'),
    ('Sports & Outdoors'),
    ('Beauty & Personal Care')
ON CONFLICT DO NOTHING;

-- Insert Users
INSERT INTO users (name, email, password, phone) VALUES
    ('Ahmed Hassan', 'ahmed@example.com', 'hashed_password_123', '01812345678'),
    ('Fatima Khan', 'fatima@example.com', 'hashed_password_456', '01712345679'),
    ('Karim Ali', 'karim@example.com', 'hashed_password_789', '01612345680'),
    ('Nadia Amin', 'nadia@example.com', 'hashed_password_012', '01512345681'),
    ('Rashed Mahmud', 'rashed@example.com', 'hashed_password_345', '01412345682')
ON CONFLICT DO NOTHING;

-- Insert Products
INSERT INTO products (name, brand, price, discount_price, stock, flash_sale, category_id) VALUES
    ('Samsung Galaxy S24', 'Samsung', 89999.00, 79999.00, 50, TRUE, 1),
    ('iPhone 15 Pro', 'Apple', 129999.00, 119999.00, 30, FALSE, 1),
    ('Sony WH-1000XM5 Headphones', 'Sony', 34999.00, 29999.00, 25, FALSE, 1),
    ('Cotton T-Shirt', 'Local Brand', 599.00, 499.00, 200, TRUE, 2),
    ('Denim Jeans', 'Levi''s', 3999.00, 2999.00, 80, FALSE, 2),
    ('Winter Jacket', 'North Face', 12999.00, 9999.00, 40, FALSE, 2),
    ('Non-stick Frying Pan', 'Tefal', 1999.00, 1499.00, 120, FALSE, 3),
    ('Stainless Steel Utensil Set', 'Delcasa', 2499.00, 1999.00, 90, TRUE, 3),
    ('The Midnight Library', 'Matt Haig', 799.00, 599.00, 150, FALSE, 4),
    ('Educated', 'Tara Westover', 699.00, 549.00, 100, FALSE, 4),
    ('Yoga Mat', 'Decathlon', 1499.00, 1099.00, 60, TRUE, 5),
    ('Running Shoes', 'Nike', 7999.00, 5999.00, 45, FALSE, 5),
    ('Face Moisturizer', 'Cetaphil', 1299.00, 999.00, 200, FALSE, 6),
    ('Shampoo Bundle', 'Loreal', 2999.00, 1999.00, 80, TRUE, 6)
ON CONFLICT DO NOTHING;

-- Insert Carts (one for each user)
INSERT INTO carts (user_id) 
SELECT id FROM users LIMIT 5
ON CONFLICT DO NOTHING;

-- Insert Cart Items (sample items in carts)
INSERT INTO cart_items (cart_id, product_id, quantity)
VALUES
    (1, 1, 1),
    (1, 7, 2),
    (2, 3, 1),
    (2, 10, 3),
    (3, 12, 1),
    (3, 13, 2)
ON CONFLICT DO NOTHING;

-- Insert Sample Orders
INSERT INTO orders (user_id, total_amount, payment_method, payment_status, order_status, shipping_address) VALUES
    ((SELECT id FROM users LIMIT 1), 129999.00, 'bKash', 'Paid', 'Delivered', '123 Main St, Dhaka, Bangladesh'),
    ((SELECT id FROM users LIMIT 1 OFFSET 1), 5999.00, 'Nagad', 'Paid', 'Pending', '456 Park Ave, Chittagong, Bangladesh'),
    ((SELECT id FROM users LIMIT 1 OFFSET 2), 79999.00, 'COD', 'Pending', 'Pending', '789 Oak Rd, Sylhet, Bangladesh')
ON CONFLICT DO NOTHING;

-- Insert Order Items
INSERT INTO order_items (order_id, product_id, quantity, price) VALUES
    ((SELECT id FROM orders LIMIT 1), 2, 1, 129999.00),
    ((SELECT id FROM orders LIMIT 1 OFFSET 1), 12, 1, 5999.00),
    ((SELECT id FROM orders LIMIT 1 OFFSET 2), 1, 1, 79999.00)
ON CONFLICT DO NOTHING;
