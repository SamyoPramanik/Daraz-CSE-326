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
        'Samsung Galaxy A55', 
        'https://images.samsung.com/is/image/samsung/p6pim/levant/feature/165062223/levant-feature--nbsp-540234962?$FB_TYPE_A_JPG$', 
        'Samsung', 'Mid-range smartphone with AMOLED display and long battery.', 
        45999.00, 
        39999.00, 
        80, 
        TRUE,
        1
    ),

    (
        'Xiaomi Redmi Note 13',
        'https://i02.appmifile.com/mi-com-product/fly-birds/redmi-note-13/PC/bac9e4d29124ae838486e7f567d14361.jpg?f=webp',
        'Xiaomi',
        'Feature-packed budget smartphone with 200MP camera.',
        24999.00,
        21999.00,
        120,
        FALSE,
        1
    ),
    (
        'OnePlus 12',
        'https://www.oneplus.com/content/dam/oasis/page/waffle-en/images-design-bottom1-1-95.jpg.avif',
        'OnePlus',
        'Flagship killer with Snapdragon 8 Gen 3 and 100W fast charging.',
        79999.00,
        72999.00,
        40,
        FALSE,
        1
    ),
('Apple AirPods Pro 2', 'https://ddfndelma2gpn.cloudfront.net/product-image/855/apple_airpods_pro_2nd_gen_1.webp', 'Apple', 'Advanced ANC earbuds with adaptive transparency and H2 chip.', 29999.00, 26999.00, 45, FALSE, 1),
('Samsung 55" 4K Smart TV', 'https://img.drz.lazcdn.com/static/bd/p/e33a1b3e5faea12d2cdbd5d07f2acbad.png_720x720q80.png', 'Samsung', '55-inch Crystal UHD 4K Smart TV with PurColor technology.', 74999.00, 64999.00, 20, TRUE, 1),


('LG 43" 4K Smart TV', 'https://www.lg.com/bd/images/tvs/md07542180/gallery/43UP7550PTC-uhd-4k-tvs-D1-1.jpg', 'LG', '43-inch UHD 4K Smart TV with ThinQ AI and webOS.', 44999.00, 39999.00, 30, FALSE, 1),
('Dell XPS 15 Laptop', 'https://adminapi.vertech.com.bd/storage/media/large/XPS-15-9530-d-2553.jpg', 'Dell', 'Premium ultrabook with Intel Core i7 and OLED display.', 149999.00, 139999.00, 15, FALSE, 1),
('HP Pavilion 15 Laptop', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQYPKJ9CA-6rDUX-9XtbzTCZQmkEZznYARFdw&s', 'HP', 'Everyday laptop with Intel Core i5 and Full HD display.', 64999.00, 57999.00, 25, FALSE, 1),
('Asus ROG Gaming Laptop', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTQKxY7WU1zpfQZ7F-2cyMKNRxLeiqC4ixwxg&s', 'Asus', 'Gaming laptop with RTX 4060 and 144Hz display.', 119999.00, 109999.00, 10, TRUE, 1),
('iPad Pro 12.9"', 'https://cdn.mos.cms.futurecdn.net/WYcLEj53eZAjjFvTepmCxB-970-80.jpg.webp', 'Apple', 'Professional iPad with M2 chip and Liquid Retina XDR display.', 114999.00, 104999.00, 20, FALSE, 1),
('Samsung Tab S9', 'https://www.startech.com.bd/image/cache/catalog/tablet/samsung/galaxy-tab-a11/galaxy-tab-a11-002-silver-228x228.webp', 'Samsung', 'Android tablet with Snapdragon 8 Gen 2 and Dynamic AMOLED.', 79999.00, 71999.00, 25, FALSE, 1),
('Canon EOS R50 Camera', 'https://www.startech.com.bd/image/cache/catalog/camera/mirriorless/canon/eos-r50/eos-r50-01-500x500.webp', 'Canon', 'Mirrorless camera with 24.2MP sensor and 4K video.', 89999.00, 79999.00, 15, FALSE, 1),
('Sony Alpha ZV-E10 Camera', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQJI03M3odw7D8CjovQXByqHBFF9AqLe3t5ZQ&s', 'Sony', 'Vlog camera with interchangeable lens and real-time Eye AF.', 64999.00, 57999.00, 20, TRUE, 1),
('Logitech MX Master 3 Mouse', 'https://adminapi.applegadgetsbd.com/storage/media/large/4127-72278.jpg', 'Logitech', 'Advanced wireless mouse with MagSpeed scrolling.', 9999.00, 8499.00, 50, FALSE, 1),
('Logitech MK470 Keyboard Mouse', 'https://vibegaming.com.bd/wp-content/uploads/2023/02/Screenshot-2023-02-18-143126-1.png.webp', 'Logitech', 'Slim wireless keyboard and mouse combo.', 5999.00, 4999.00, 70, FALSE, 1),
('Samsung Galaxy Watch 6', 'https://gadgetbreeze.com.bd/wp-content/uploads/2023/11/SAMSUNG-Galaxy-Watch-6-Classic-47mm.jpg', 'Samsung', 'Advanced smartwatch with health monitoring and Wear OS.', 34999.00, 29999.00, 40, FALSE, 1),


('Sony Alpha ZV-E10 Camera', 'https://www.startech.com.bd/image/cache/catalog/camera/digital-camera/sony/zv-e10/zv-e10-01-500x500.jpg', 'Sony', 'Vlog camera with interchangeable lens and real-time Eye AF.', 64999.00, 57999.00, 20, TRUE, 1),

('Xiaomi Smart Band 8', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSIMAvxLjb6LBW-xCGMtZ-Zb2RZtJtdFT0Pew&s', 'Xiaomi', 'Fitness tracker with heart rate monitor and 16-day battery.', 3999.00, 2999.00, 150, TRUE, 1),   

('Apple Watch Series 9', 'https://www.custommacbd.com/cdn/shop/files/Watch-s9-midnight-Custom-Mac-BD.jpg?v=1696082496', 'Apple', 'Most powerful Apple Watch with S9 chip and double tap gesture.', 54999.00, 49999.00, 30, FALSE, 1),

('Anker 65W GaN Charger', 'https://gadgetnmusic.com/wp-content/uploads/2022/09/A2668111_TD01_V1.webp', 'Anker', 'Compact 65W GaN charger with 3 ports for multiple devices.', 3499.00, 2999.00, 200, TRUE, 1),

('Baseus 20000mAh Power Bank', 'https://static-01.daraz.com.bd/p/62e12f7bf9a272564acaae58e8db01b1.jpg', 'Baseus', 'High-capacity power bank with 65W fast charging support.', 4999.00, 3999.00, 100, FALSE, 1),

('Samsung 1TB SSD', 'https://ddfndelma2gpn.cloudfront.net/product-image/1898/Samsung_T7_Shield_2TB_USB_3.2_Type-C_Portable_SSD_2.webp', 'Samsung', '970 EVO Plus NVMe SSD with read speeds up to 3500MB/s.', 12999.00, 10999.00, 60, FALSE, 1),

('Seagate 2TB External HDD', 'https://www.perennial.com.bd/image/cache/catalog/Pc%20components/Portable%20Hard%20disk%20Drive%20/Seagate/1-228x228.jpeg', 'Seagate', 'Portable 2TB external hard drive for backup and storage.', 5999.00, 4999.00, 80, FALSE, 1),

('TP-Link WiFi 6 Router', 'https://www.startech.com.bd/image/cache/catalog/router/tp-link/archer-c6-ac1200/archer-c6-ac1200-5-500x500.jpg', 'TP-Link', 'AX3000 dual-band WiFi 6 router for faster connectivity.', 8999.00, 7499.00, 45, TRUE, 1),

('Xiaomi Mi Projector 2 Pro', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQuk0zxIKch-LuSZWCoV9b0WRwqhYejWVCm6Q&s', 'Xiaomi', '1080p laser projector with Dolby Audio and Android TV.', 49999.00, 43999.00, 15, FALSE, 1),

('PlayStation 5 Console', 'https://www.startech.com.bd/image/cache/catalog/gaming-console/playstation/playstation-5-digital-edition/ps5-digital-edition-01-500x500.webp', 'Sony', 'Next-gen gaming console with ultra-high speed SSD.', 69999.00, 64999.00, 10, FALSE, 1),

('Xbox Series X', 'https://img.drz.lazcdn.com/static/bd/p/0f1a2b3c4d5e6f7a8b9c0d1e.jpg_720x720q80.jpg', 'Microsoft', 'Most powerful Xbox with 4K gaming at 120fps.', 64999.00, 59999.00, 12, FALSE, 1),

('Rode NT-USB Microphone', 'https://www.startech.com.bd/image/cache/catalog/microphone/rode/nt-usb-plus/nt-usb-plus-01-500x500.webp', 'Rode', 'Studio-quality USB microphone for podcasting and streaming.', 15999.00, 13999.00, 30, FALSE, 1),

('Elgato Stream Deck MK.2', 'https://www.startech.com.bd/image/cache/catalog/stream-deck/corsair/elgato-stream-deck-mk2%20/elgato-stream-deck-mk2%20-03-500x500.webp', 'Elgato', 'Live production controller with 15 customizable LCD keys.', 17999.00, 15999.00, 20, FALSE, 1),

('Formal Dress Shirt', 'https://anthonysinclair.com/cdn/shop/products/SkyBlueFineTwillCocktailCuffShirt-1_800x.jpg?v=1664623810', 'Arrow', 'Premium wrinkle-resistant formal shirt for office wear.', 1999.00, 1499.00, 150, FALSE, 2),

('Polo T-Shirt', 'https://fabrilife.com/products/64944f852b247-square.jpg?v=20', 'Ralph Lauren', 'Classic polo shirt with embroidered logo.', 2999.00, 2499.00, 100, FALSE, 2),

('Slim Fit Chinos', 'https://www.lerevecraze.com/wp-content/uploads/2025/12/e14f9db1-fdad-4f50-a5db-8ab9d52df714.jpg', 'Dockers', 'Slim fit cotton chino pants with stretch fabric.', 2499.00, 1999.00, 90, TRUE, 2),

('Hoodie Sweatshirt', 'https://bdmanja.com/wp-content/uploads/2020/11/20250925_1429_Gray-Hoodie-Design_remix_01k5zzr4z4ff190hdbksxt8pg7-300x300.jpg', 'Champion', 'Cozy fleece hoodie with kangaroo pocket.', 1999.00, 1599.00, 120, FALSE, 2),

('Floral Kurti', 'https://saffronthreadsclothing.com/cdn/shop/files/4538.jpg?v=1756478709', 'Rang Bangladesh', 'Beautiful floral print kurti in soft cotton fabric.', 999.00, 799.00, 200, TRUE, 2),

('Salwar Kameez Set', 'https://flickere.com.bd/public/uploads/all/sIFCuVnuLUsHlai45h4DU0h9DxPY0MvbbtdV4ZzV.webp', 'Aarong', 'Traditional handloom salwar kameez with embroidery.', 3999.00, 3299.00, 60, FALSE, 2),


('Tangail Saree', 'https://5.imimg.com/data5/SELLER/Default/2025/2/485483308/WI/RY/EO/186069263/royal-blue-tangail-saree.png', 'Tangail Saree Kuthi', 'Elegant pure cotton Tangail saree with beautiful border.', 2499.00, 1999.00, 50, FALSE, 2),

('Panjabi', 'https://www.vibrantbd.com/cdn/shop/files/24190041.jpg?v=1771924574&width=2000', 'Yellow', 'Classic white cotton panjabi for Eid and events.', 1499.00, 1199.00, 80, TRUE, 2),

('Sports Jersey', 'https://diamu.com.bd/wp-content/uploads/2026/01/Chelsea-Third-Authentic-Jersey-2025-26-Best-Price-in-Bangladesh-300x300.jpg', 'Nike', 'Moisture-wicking sports jersey for training.', 2499.00, 1999.00, 100, FALSE, 2),

('Track Pants', 'https://img.drz.lazcdn.com/static/bd/p/d162d0cb3317e3653bad16c298cfe730.jpg_960x960q80.jpg_.webp', 'Adidas', 'Comfortable track pants with three stripes design.', 2999.00, 2499.00, 80, FALSE, 2),

('Shorts', 'https://hips.hearstapps.com/hmg-prod/images/mhl-shorts-octobre-547-67f416b1a6ccd.jpg?crop=0.6666666666666667xw:1xh;center,top&resize=1200:*', 'Puma', 'Lightweight cotton blend shorts for gym and casual wear.', 1299.00, 999.00, 150, FALSE, 2),

('Cargo Pants', 'https://gorurghash.com/wp-content/uploads/2024/09/605A0076-copy.jpg', 'Lee', 'Durable cargo pants with multiple pockets.', 3499.00, 2799.00, 70, TRUE, 2),

('Leather Belt', 'https://img.drz.lazcdn.com/g/kf/S4c55e0c81e244f319089a6b08d6ce2eea.jpg_720x720q80.jpg', 'Tommy Hilfiger', 'Genuine leather belt with classic buckle design.', 1999.00, 1599.00, 100, FALSE, 2),

('Necktie Set', 'https://img.drz.lazcdn.com/static/bd/p/c953192afd3f938cdbf741ad09fd31be.jpg_720x720q80.jpg', 'Van Heusen', 'Set of 3 premium silk neckties for formal occasions.', 2499.00, 1999.00, 60, FALSE, 2),

('Socks Pack', 'https://levin.com.bd/cdn/shop/files/web-1_ed9d5bc5-e233-477c-b0e4-ccaf088a5fab.jpg?v=1767092927&width=2048', 'Puma', 'Pack of 6 cotton sport socks with cushioned sole.', 799.00, 599.00, 300, TRUE, 2),

('Blazer', 'https://www.jny.com/cdn/shop/files/10826460-K64-F.jpg?v=1758060865&width=422', 'Raymond', 'Slim fit formal blazer in premium wool blend.', 8999.00, 7499.00, 30, FALSE, 2),

('Winter Sweater', 'https://smartdeal.com.bd/public/uploads/all/TD9Gu80wzqykH5OT0zmyeARxMhUOV5gDq0IcBFya.jpg', 'Woolrich', 'Warm knitted sweater with round neck for winter.', 2999.00, 2499.00, 80, FALSE, 2),

('Rain Jacket', 'https://stonz.com/cdn/shop/files/RAINJACKET_SUMMERHAZE_MAIN.png?v=1753215748&width=1946', 'Columbia', 'Waterproof rain jacket with sealed seams and adjustable hood.', 5999.00, 4999.00, 40, TRUE, 2),

('Kids T-Shirt Pack', 'https://xcdn.next.co.uk/common/items/default/default/itemimages/3_4Ratio/product/lge/736344s.jpg', 'H&M Kids', 'Pack of 3 colorful cotton T-shirts for kids.', 999.00, 799.00, 150, FALSE, 2),

('Kids Jeans', 'https://www.nameit.com/dw/image/v2/BDTC_PRD/on/demandware.static/-/Sites-pim-catalog/default/dw018423b2/pim-static/NI/13248484/13248484_MediumBlueDenim_008.jpg?sw=900&sh=1200&strip=false', 'Zara Kids', 'Comfortable stretch denim jeans for kids.', 1499.00, 1199.00, 100, FALSE, 2),

('School Uniform Shirt', 'https://static-01.daraz.com.bd/p/10dc019e907ea6fd6168d3269d021311.png', 'Local Brand', 'Pure white cotton school uniform shirt.', 499.00, 399.00, 300, TRUE, 2),

('Leather Sandal', 'https://myzoo.asia/public/uploads/all/MlX1yBRV2EH4DiIU4FU7u2f4HQ2vX6stk0XLyPyp.png', 'Bata', 'Comfortable leather sandals for everyday casual wear.', 1999.00, 1499.00, 100, FALSE, 2),

('Formal Shoes', 'https://orionfootwearltd.com/images/media/2023/12/medium1702983426TLHPl19304.jpg', 'Clarks', 'Premium leather formal shoes with cushioned insole.', 5999.00, 4999.00, 50, FALSE, 2),

('Sneakers', 'https://www.vibrantbd.com/cdn/shop/files/88000101.jpg?v=1730351022', 'Adidas', 'Classic canvas sneakers for casual everyday wear.', 4999.00, 3999.00, 80, TRUE, 2),

('Flip Flops', 'https://nationaltoday.com/wp-content/uploads/2021/06/Flip-Flop.jpg', 'Havaianas', 'Lightweight rubber flip flops for beach and home.', 799.00, 599.00, 200, FALSE, 2),

('Hijab', 'https://veiled.com/cdn/shop/files/modal-hijab-deep-taupe-386257.jpg?crop=center&height=1200&v=1754844466&width=1200', 'Modanisa', 'Premium chiffon hijab in pastel colors.', 599.00, 449.00, 200, FALSE, 2),

('Abaya', 'https://basmastour.com/cdn/shop/files/IMG-2627.jpg?v=1696239604&width=2948', 'Modanisa', 'Elegant black abaya with embroidered cuffs.', 3499.00, 2799.00, 60, FALSE, 2),

('Sunglasses', 'https://img.freepik.com/free-psd/elegant-black-gold-sunglasses-stylish-accessory_191095-79382.jpg?semt=ais_hybrid&w=740&q=80', 'Ray-Ban', 'Classic Wayfarer sunglasses with UV400 protection.', 4999.00, 3999.00, 70, TRUE, 2),

('Baseball Cap', 'https://img.drz.lazcdn.com/static/bd/p/932e5c77da936b271dcab48502b20c21.jpg_720x720q80.jpg', 'New Era', 'Adjustable cotton baseball cap for sun protection.', 999.00, 799.00, 150, FALSE, 2),








































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