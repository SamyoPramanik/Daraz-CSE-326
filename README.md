# Daraz eCommerce Database

## Quick Start

### 1. Start Database
```bash
docker compose up -d
```

### 2. Verify
```bash
curl http://localhost:4000/health
psql -h localhost -U daraz_user -d daraz_db -c "\dt"
```

### 3. Sample Queries
```bash
psql -h localhost -U daraz_user -d daraz_db
SELECT COUNT(*) FROM products;  -- 14
SELECT COUNT(*) FROM reviews;   -- 5
SELECT COUNT(*) FROM bookings;  -- 4
```

---

## Schema (9 Tables)

**Core**: users, categories, products, carts, cart_items  
**Orders**: orders, order_items  
**Features**: reviews (⭐ NEW), bookings (⭐ NEW)  

---

## v2.1 Changes

### Products
- ID: SERIAL → UUID (scalable)
- Added: description TEXT

### Reviews (NEW)
```sql
rating INT (1-5)
review TEXT
UNIQUE (user_id, product_id)
```

### Bookings (NEW)
```sql
booking_count INT (stock reservation)
UNIQUE (user_id, product_id)
```

---

## Essential Queries

**Get Product Rating**:
```sql
SELECT ROUND(AVG(r.rating), 2)
FROM reviews r WHERE product_id = $1;
```

**Get Reviews**:
```sql
SELECT u.name, r.rating, r.review
FROM reviews r JOIN users u ON r.user_id = u.id
WHERE product_id = $1;
```

**Create Review**:
```sql
INSERT INTO reviews (user_id, product_id, rating, review)
VALUES ($1, $2, $3, $4)
ON CONFLICT (user_id, product_id) DO UPDATE SET rating = $3;
```

**Check Available Stock**:
```sql
SELECT stock - COALESCE(SUM(booking_count), 0)
FROM products p LEFT JOIN bookings b ON p.id = b.product_id
WHERE p.id = $1;
```

**Create Booking**:
```sql
INSERT INTO bookings (user_id, product_id, booking_count)
VALUES ($1, $2, $3)
ON CONFLICT (user_id, product_id) DO UPDATE SET booking_count = $3;
```

**Get User Bookings**:
```sql
SELECT p.name, b.booking_count
FROM bookings b JOIN products p ON b.product_id = p.id
WHERE user_id = $1;
```

**Delete Booking**:
```sql
DELETE FROM bookings WHERE user_id = $1 AND product_id = $2;
```

---

## Node.js Connection

```javascript
const { Pool } = require('pg');
const pool = new Pool({
    user: process.env.DB_USER || 'daraz_user',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'daraz_db',
    password: process.env.DB_PASSWORD || 'daraz_password',
    port: process.env.DB_PORT || 5432,
});

// Usage
const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
console.log(result.rows);
```

---

## Setup

### Docker
```bash
docker compose up -d
```
Credentials: daraz_user / daraz_password / daraz_db / 5432

### Local PostgreSQL
```bash
sudo -u postgres psql -c "CREATE USER daraz_user WITH PASSWORD 'daraz_password';"
sudo -u postgres psql -c "CREATE DATABASE daraz_db OWNER daraz_user;"
psql -U daraz_user -d daraz_db -f database/migrations.sql
psql -U daraz_user -d daraz_db -f database/seed.sql
```

---

## Sample Data

- 14 Products (with descriptions)
- 5 Reviews (4-5 star ratings)
- 4 Bookings (reservations)
- 5 Users (test accounts)
- 6 Categories

---

## API to Build

- `GET /api/products/:id/reviews`
- `POST /api/reviews`
- `DELETE /api/reviews/:id`
- `POST /api/bookings`
- `GET /api/bookings`
- `DELETE /api/bookings/:id`

---

## Development Phases
- ✅ Phase 1-2: Database
- Phase 3: User Auth
- Phase 4: Products
- Phase 5: Cart
- Phase 6: Orders
- Phase 7+: Payments, Admin, Deployment

See [DEVELOPMENT_CHECKLIST.md](DEVELOPMENT_CHECKLIST.md) for details.

---

## Troubleshooting

**Docker Permission**:
```bash
sudo usermod -aG docker $USER && newgrp docker
```

**Reset All**:
```bash
docker compose down -v && docker compose up --build
```

---

**Status**: ✅ Production Ready (v2.1)  
**Tables**: 9 | **Records**: 100+  

🚀 Start coding!
