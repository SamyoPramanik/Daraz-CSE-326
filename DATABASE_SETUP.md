# PostgreSQL Database Setup Guide

## ✅ What's Been Updated

### 1. **migrations.sql** - Complete Schema
- ✨ UUID support with pgcrypto extension enabled
- 👥 Users table (with UUID PK)
- 📂 Categories table
- 🛍️ Products table (with brand, discount_price, flash_sale)
- 🛒 Carts table (user-specific)
- 📦 CartItems table
- 📋 Orders table (comprehensive order management)
- 🎁 OrderItems table (stores price at time of order)
- 📊 Performance indexes on foreign keys

### 2. **seed.sql** - Sample Data
- 6 sample categories
- 5 test users
- 14 sample products across categories
- Shopping carts with items
- 3 sample orders

### 3. **config/db.js** - Already Configured ✓
Environment variables are already set up correctly:
- `DB_USER: daraz_user`
- `DB_PASSWORD: daraz_password`
- `DB_HOST: db`
- `DB_NAME: daraz_db`
- `DB_PORT: 5432`

### 4. **docker-compose.yaml** - Already Configured ✓
- PostgreSQL 15 Alpine
- Correct environment variables
- Database initialization from `/database` folder
- Health checks enabled

## 🚀 How to Start

### Option 1: Using Docker (Recommended)

Fix Docker permissions first:
```bash
# Add user to docker group
sudo usermod -aG docker $USER
# Apply group membership
newgrp docker
```

Then run:
```bash
cd /path/to/Daraz
docker compose down -v  # Clean up old data
docker compose up --build
```

### Option 2: Local PostgreSQL Setup

If Docker isn't working, install PostgreSQL locally:

```bash
# On Ubuntu/Debian
sudo apt-get install postgresql postgresql-contrib

# Start the service
sudo systemctl start postgresql

# Connect to PostgreSQL
sudo -u postgres psql
```

Then create the database and user:
```sql
CREATE USER daraz_user WITH PASSWORD 'daraz_password';
CREATE DATABASE daraz_db OWNER daraz_user;
```

Run the migrations:
```bash
psql -h localhost -U daraz_user -d daraz_db -f database/migrations.sql
psql -h localhost -U daraz_user -d daraz_db -f database/seed.sql
```

## ✅ Verify Installation

Connect to your database:
```bash
psql -h localhost -U daraz_user -d daraz_db
```

Check tables:
```sql
\dt  -- Lists all tables
\d users  -- Describes users table
```

Check sample data:
```sql
SELECT COUNT(*) FROM products;  -- Should return 14
SELECT COUNT(*) FROM users;     -- Should return 5
```

## 📋 Database Schema Overview

### Users
- **id**: UUID (auto-generated)
- **name**: VARCHAR(255)
- **email**: VARCHAR(255) UNIQUE
- **password**: VARCHAR(255)
- **phone**: VARCHAR(20)
- **created_at**: TIMESTAMP

### Products
- **id**: SERIAL
- **name**: VARCHAR(255)
- **brand**: VARCHAR(255)
- **price**: NUMERIC(10,2)
- **discount_price**: NUMERIC(10,2) (optional)
- **stock**: INT
- **flash_sale**: BOOLEAN
- **category_id**: FK to categories

### Orders
- **id**: UUID (auto-generated)
- **user_id**: FK to users (UUID)
- **total_amount**: NUMERIC(10,2)
- **payment_method**: VARCHAR (bKash/Nagad/COD)
- **payment_status**: VARCHAR (Paid/Pending/Refunded)
- **order_status**: VARCHAR (Pending/Cancelled/Delivered)
- **shipping_address**: TEXT
- **created_at**: TIMESTAMP

## 🔗 Key Relationships

```
users (1) ---> (∞) carts
        |---> (∞) orders

categories (1) ---> (∞) products

products (1) ---> (∞) cart_items
        |---> (∞) order_items

carts (1) ---> (∞) cart_items

orders (1) ---> (∞) order_items
```

All foreign keys have `ON DELETE CASCADE` for data integrity.

## 🚀 Next Steps

1. **Test API Health Check**:
   ```bash
   curl http://localhost:4000/health
   ```
   Expected response: Database is connected ✓

2. **Create Controllers** for:
   - User authentication
   - Product listing & filtering
   - Cart management
   - Order processing

3. **Add Routes** for:
   - User signup/login
   - Product search
   - Cart operations
   - Order creation

4. **Implement JWT Authentication** to secure user data

## 📝 Notes

- Passwords in seed.sql are for testing only
- Use bcrypt to hash passwords in production
- The pgcrypto extension auto-generates UUIDs
- Numeric values use NUMERIC(10,2) for currency precision
- All timestamps are in UTC (NOW())

## ❓ Troubleshooting

**Connection refused?**
- Ensure PostgreSQL is running
- Check DB_HOST matches (localhost for local, 'db' for Docker)

**Tables don't exist?**
- Run migrations.sql first, then seed.sql
- Check file paths are correct

**Duplicate key errors?**
- `ON CONFLICT DO NOTHING` prevents duplicate inserts
- Safe for re-running

---

Happy coding! 🚀
