-- Seed data for Daraz eCommerce Platform

-- Insert Categories
INSERT INTO
    categories (name)
VALUES ('Electronics'),
    ('Clothing'),
    ('Home & Kitchen'),
    ('Books'),
    ('Sports & Outdoors'),
    ('Beauty & Personal Care') ON CONFLICT DO NOTHING;

-- Insert Users
INSERT INTO
    users (name, email, password, phone)
VALUES (
        'Ahmed Hassan',
        'ahmed@example.com',
        'hashed_password_123',
        '01812345678'
    ),
    (
        'Fatima Khan',
        'fatima@example.com',
        'hashed_password_456',
        '01712345679'
    ),
    (
        'Karim Ali',
        'karim@example.com',
        'hashed_password_789',
        '01612345680'
    ),
    (
        'Nadia Amin',
        'nadia@example.com',
        'hashed_password_012',
        '01512345681'
    ),
    (
        'Rashed Mahmud',
        'rashed@example.com',
        'hashed_password_345',
        '01412345682'
    ) ON CONFLICT DO NOTHING;

-- Insert Products (with descriptions)
INSERT INTO
    products (
        name,
        image_url,
        brand,
        description,
        price,
        discount_price,
        stock,
        flash_sale,
        category_id
    )
VALUES (
        'Samsung Galaxy S24',
        'https://app-area.riointernational.com.bd/productImages/QklAT1732037791.webp',
        'Samsung',
        'Latest flagship smartphone with advanced camera system and 5G connectivity.',
        89999.00,
        79999.00,
        50,
        TRUE,
        1
    ),
    (
        'iPhone 15 Pro',
        'https://ddfndelma2gpn.cloudfront.net/color/682/iphone_15_pro__Natural_Titanium_3__2.webp',
        'Apple',
        'Premium Apple smartphone with A17 Pro chip and titanium design.',
        129999.00,
        119999.00,
        30,
        FALSE,
        1
    ),
    (
        'Sony WH-1000XM5 Headphones',
        'https://ddfndelma2gpn.cloudfront.net/color/3538/Sony_WH-CH720_Wireless_Noise_Canceling_Headphone_-_Blue.webp',
        'Sony',
        'Industry-leading noise-canceling wireless headphones with superior sound quality.',
        34999.00,
        29999.00,
        25,
        FALSE,
        1
    ),
    (
        'Cotton T-Shirt',
        'https://fabrilife.com/products/6465ff10c753e-square.jpg?v=20',
        'Local Brand',
        'Comfortable 100% organic cotton T-shirt, perfect for everyday wear.',
        599.00,
        499.00,
        200,
        TRUE,
        2
    ),
    (
        'Denim Jeans',
        'https://fabrilife.com/products/69a9109a0b893-square.jpg?v=20',
        'Levi''s',
        'Classic durable denim jeans with timeless style.',
        3999.00,
        2999.00,
        80,
        FALSE,
        2
    ),
    (
        'Winter Jacket',
        'https://fabrilife.com/products/695b8d50c3f8d-square.jpg?v=20',
        'North Face',
        'Insulated winter jacket with waterproof shell and warmth insulation.',
        12999.00,
        9999.00,
        40,
        FALSE,
        2
    ),
    (
        'Non-stick Frying Pan',
        'https://img.drz.lazcdn.com/static/bd/p/4ae85bdea7eea80a842c00a9cf4cabb0.jpg_720x720q80.jpg',
        'Tefal',
        'Durable non-stick frying pan for healthy cooking.',
        1999.00,
        1499.00,
        120,
        FALSE,
        3
    ),
    (
        'Stainless Steel Utensil Set',
        'https://img.drz.lazcdn.com/static/bd/p/440b66c3d09e158ba862d96fe4a3fb7f.jpg_720x720q80.jpg',
        'Delcasa',
        'Complete kitchen utensil set with professional-grade stainless steel.',
        2499.00,
        1999.00,
        90,
        TRUE,
        3
    ),
    (
        'The Midnight Library',
        'https://cdn.othoba.com/images/thumbs/1544445_the-midnight-library-a-novel.jpeg',
        'Matt Haig',
        'Bestselling fiction novel exploring infinite possibilities and life choices.',
        799.00,
        599.00,
        150,
        FALSE,
        4
    ),
    (
        'Educated',
        'https://fridaysgarden.sg/cdn/shop/files/IMG_6438_1100x.jpg?v=1693042915',
        'Tara Westover',
        'Memoir about a woman who leaves her survivalist family to pursue education.',
        699.00,
        549.00,
        100,
        FALSE,
        4
    ),
    (
        'Yoga Mat',
        'https://img.drz.lazcdn.com/static/bd/p/8aa67c0d51a40864ad2633e1703ee04b.png_720x720q80.png',
        'Decathlon',
        'Non-slip exercise yoga mat with carrying strap.',
        1499.00,
        1099.00,
        60,
        TRUE,
        5
    ),
    (
        'Running Shoes',
        'https://img.drz.lazcdn.com/static/bd/p/22036e7ab635c5c1f0b824384c6cc192.jpg_720x720q80.jpg',
        'Nike',
        'High-performance running shoes with advanced cushioning technology.',
        7999.00,
        5999.00,
        45,
        FALSE,
        5
    ),
    (
        'Face Moisturizer',
        'https://img.drz.lazcdn.com/static/bd/p/fa4a3528f4961e539fc43f0737cdf0f2.png_720x720q80.png',
        'Cetaphil',
        'Hypoallergenic facial moisturizer suitable for all skin types.',
        1299.00,
        999.00,
        200,
        FALSE,
        6
    ),
    (
        'Shampoo Bundle',
        'https://img.drz.lazcdn.com/static/bd/p/73598bde01dcbc3e1eddf941ce07cdde.png_720x720q80.png',
        'Loreal',
        'Professional hair care shampoo and conditioner bundle set.',
        2999.00,
        1999.00,
        80,
        TRUE,
        6
    ) ON CONFLICT DO NOTHING;

-- Insert Sample Orders
INSERT INTO
    orders (
        user_id,
        total_amount,
        payment_method,
        payment_status,
        order_status,
        shipping_address
    )
VALUES (
        (
            SELECT id
            FROM users
            LIMIT 1
        ),
        129999.00,
        'bKash',
        'Paid',
        'Delivered',
        '123 Main St, Dhaka, Bangladesh'
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
            OFFSET
                1
        ),
        5999.00,
        'Nagad',
        'Paid',
        'Pending',
        '456 Park Ave, Chittagong, Bangladesh'
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
            OFFSET
                2
        ),
        79999.00,
        'COD',
        'Pending',
        'Pending',
        '789 Oak Rd, Sylhet, Bangladesh'
    ) ON CONFLICT DO NOTHING;

-- Insert Order Items (using product UUIDs)
INSERT INTO
    order_items (
        order_id,
        product_id,
        quantity,
        price,
        rating,
        review,
        review_date
    )
VALUES (
        (
            SELECT id
            FROM orders
            LIMIT 1
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'iPhone 15 Pro'
        ),
        1,
        129999.00,
        5,
        'Excellent product!',
        NOW()
    ),
    (
        (
            SELECT id
            FROM orders
            LIMIT 1
            OFFSET
                1
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'Running Shoes'
        ),
        1,
        5999.00,
        5,
        'Very comfortable for long runs. Great build quality.',
        NOW()
    ),
    (
        (
            SELECT id
            FROM orders
            LIMIT 1
            OFFSET
                2
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'Samsung Galaxy S24'
        ),
        1,
        79999.00,
        5,
        'Great performance and battery life.',
        NOW()
    ) ON CONFLICT DO NOTHING;

-- ⭐ Insert Bookings (temporary reservations during checkout)
INSERT INTO
    bookings (
        user_id,
        product_id,
        booking_count
    )
VALUES (
        (
            SELECT id
            FROM users
            LIMIT 1
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'iPhone 15 Pro'
        ),
        1
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
            OFFSET
                1
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'Winter Jacket'
        ),
        1
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
            OFFSET
                2
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'Denim Jeans'
        ),
        2
    ),
    (
        (
            SELECT id
            FROM users
            LIMIT 1
            OFFSET
                3
        ),
        (
            SELECT id
            FROM products
            WHERE
                name = 'The Midnight Library'
        ),
        1
    ) ON CONFLICT DO NOTHING;