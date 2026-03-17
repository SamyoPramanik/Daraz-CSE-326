-- seed.sql
-- Insert initial data only if tables are empty

-- Users
INSERT INTO users (name, email)
SELECT 'Admin User', 'admin@daraz.local'
WHERE NOT EXISTS (SELECT 1 FROM users LIMIT 1);

INSERT INTO users (name, email)
SELECT 'Test Customer', 'customer@daraz.local'
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'customer@daraz.local');

-- Products
INSERT INTO products (title, description, price, stock)
SELECT 'Wireless Headphones', 'Noise-cancelling over-ear headphones.', 149.99, 50
WHERE NOT EXISTS (SELECT 1 FROM products LIMIT 1);

INSERT INTO products (title, description, price, stock)
SELECT 'Gaming Laptop', 'High performance gaming laptop with RTX 4070.', 1299.00, 10
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Gaming Laptop');

INSERT INTO products (title, description, price, stock)
SELECT 'Mechanical Keyboard', 'RGB mechanical keyboard with blue switches.', 89.50, 150
WHERE NOT EXISTS (SELECT 1 FROM products WHERE title = 'Mechanical Keyboard');
