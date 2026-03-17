# 🚀 Daraz Development Checklist

Use this checklist to track your progress as you build out the Daraz eCommerce platform.

## Phase 1: Database Setup ✅ (COMPLETED)

- [x] PostgreSQL schema design
- [x] Create all tables (users, products, orders, carts, etc.)
- [x] Add foreign key relationships
- [x] Create performance indexes
- [x] Create seed data
- [x] Docker configuration
- [x] Environment variables setup
- [x] Database documentation

**Status**: Ready to proceed to Phase 2

---

## Phase 2: Backend Setup & Testing

### Express Server
- [ ] Install dependencies: `npm install express pg dotenv cors`
- [ ] Create .env file from .env.example
- [ ] Test database connection
  - [ ] GET `/health` should return database timestamp
  - [ ] Verify all tables exist
  - [ ] Verify seed data loaded

**Commands**:
```bash
# Start Docker containers
docker compose up -d

# Test connection
curl http://localhost:4000/health

# Verify tables
psql -h localhost -U daraz_user -d daraz_db -c "\dt"

# Check sample data
psql -h localhost -U daraz_user -d daraz_db -c "SELECT COUNT(*) FROM products;"
```

### Error Handling & Validation
- [ ] Add error handling middleware
- [ ] Add input validation
- [ ] Add CORS middleware
- [ ] Add request logging

---

## Phase 3: User Management

### User Controller (`backend/controllers/userController.js`)
- [ ] User registration endpoint
  - [ ] Validate email format
  - [ ] Check if user exists
  - [ ] Hash password with bcrypt
  - [ ] Create user record
  - [ ] Return JWT token

- [ ] User login endpoint
  - [ ] Validate credentials
  - [ ] Hash comparison
  - [ ] Generate JWT token
  - [ ] Set refresh token in cookie

- [ ] Get user profile endpoint
  - [ ] Require JWT authentication
  - [ ] Return user details
  - [ ] Exclude password

- [ ] Update profile endpoint
  - [ ] Validate input
  - [ ] Update user data
  - [ ] Return updated user

### User Routes (`backend/routes/userRoute.js`)
- [ ] POST `/api/users/register`
- [ ] POST `/api/users/login`
- [ ] GET `/api/users/profile`
- [ ] PUT `/api/users/profile`
- [ ] POST `/api/users/logout`

### Authentication Middleware
- [ ] Create JWT verification middleware
- [ ] Protect routes with middleware
- [ ] Handle token expiration
- [ ] Refresh token logic

**Dependencies**: 
```bash
npm install bcryptjs jsonwebtoken
```

---

## Phase 4: Product Management

### Product Controller (`backend/controllers/productController.js`)
- [ ] Get all products
  - [ ] Pagination support
  - [ ] Include category name
  - [ ] Filter by category
  - [ ] Search by name/brand
  - [ ] Filter by price range
  - [ ] Filter flash sales
  - [ ] Sort options

- [ ] Get single product
  - [ ] Include category details
  - [ ] Calculate discount percentage
  - [ ] Stock availability

- [ ] Create product (admin)
  - [ ] Validate inputs
  - [ ] Check category exists
  - [ ] Create record

- [ ] Update product (admin)
  - [ ] Validate inputs
  - [ ] Update stock
  - [ ] Update pricing

- [ ] Delete product (admin)
  - [ ] Soft delete option?
  - [ ] Check for active orders

### Product Routes
- [ ] GET `/api/products` (with filters)
- [ ] GET `/api/products/:id`
- [ ] POST `/api/products` (admin)
- [ ] PUT `/api/products/:id` (admin)
- [ ] DELETE `/api/products/:id` (admin)
- [ ] GET `/api/categories`

### Search & Filter Features
- [ ] Category filtering
- [ ] Price range filtering
- [ ] Search by product name/brand
- [ ] Flash sale products
- [ ] Stock availability
- [ ] Pagination
- [ ] Sorting options

---

## Phase 5: Shopping Cart

### Cart Controller (`backend/controllers/cartController.js`)
- [ ] Get user's cart
  - [ ] With product details
  - [ ] Calculate totals
  - [ ] Show item quantities

- [ ] Add to cart
  - [ ] Validate product exists
  - [ ] Check stock availability
  - [ ] Create cart if not exists
  - [ ] Add or update item

- [ ] Update cart item quantity
  - [ ] Validate quantity
  - [ ] Check stock
  - [ ] Update quantity

- [ ] Remove from cart
  - [ ] Delete cart item
  - [ ] Clean empty carts

- [ ] Clear cart
  - [ ] Delete all items
  - [ ] Delete cart record

### Cart Routes
- [ ] GET `/api/cart`
- [ ] POST `/api/cart/add`
- [ ] PUT `/api/cart/item/:id`
- [ ] DELETE `/api/cart/item/:id`
- [ ] DELETE `/api/cart/clear`

### Cart Features
- [ ] Real-time stock validation
- [ ] Price calculations (with discounts)
- [ ] Quantity restrictions
- [ ] Save cart to database
- [ ] Persist across sessions

---

## Phase 6: Orders & Checkout

### Order Controller (`backend/controllers/orderController.js`)
- [ ] Create order
  - [ ] Get cart items
  - [ ] Calculate totals
  - [ ] Validate stock
  - [ ] Reduce product stock
  - [ ] Create order record
  - [ ] Create order items
  - [ ] Clear customer cart
  - [ ] Return order confirmation

- [ ] Get user orders
  - [ ] List all user orders
  - [ ] With sorting/filtering
  - [ ] Pagination

- [ ] Get order details
  - [ ] Order header info
  - [ ] Order items
  - [ ] Product details
  - [ ] Pricing and totals

- [ ] Update order status
  - [ ] Admin only
  - [ ] Validate status transitions
  - [ ] Send notifications

- [ ] Update payment status
  - [ ] Admin/payment gateway
  - [ ] Trigger fulfillment

### Order Routes
- [ ] POST `/api/orders/create` (from cart)
- [ ] GET `/api/orders` (user orders)
- [ ] GET `/api/orders/:id` (order details)
- [ ] PUT `/api/orders/:id/status` (admin)
- [ ] PUT `/api/orders/:id/payment-status` (admin)
- [ ] POST `/api/orders/:id/cancel` (user)

### Order Features
- [ ] Stock management (reduce on order)
- [ ] Order confirmation email
- [ ] Payment status tracking
- [ ] Order status updates
- [ ] Cancel order functionality
- [ ] Order history

---

## Phase 7: Payment Integration

### Payment Methods to Support
- [ ] bKash (Bangladesh mobile wallet)
  - [ ] API integration
  - [ ] Payment verification
  - [ ] Webhook handling

- [ ] Nagad (Bangladesh mobile payment)
  - [ ] API integration
  - [ ] Payment verification
  - [ ] Webhook handling

- [ ] Cash on Delivery (COD)
  - [ ] Manual verification
  - [ ] Payment collection

### Payment Routes
- [ ] POST `/api/payments/initiate`
- [ ] POST `/api/payments/verify`
- [ ] POST `/api/payments/webhook` (bKash/Nagad)
- [ ] GET `/api/payments/status/:id`

---

## Phase 8: Admin Panel

### Admin Routes & Features
- [ ] Dashboard
  - [ ] Total sales
  - [ ] Order count
  - [ ] Revenue charts
  - [ ] Best sellers

- [ ] Product Management
  - [ ] CRUD operations
  - [ ] Stock management
  - [ ] Flash sales management

- [ ] Order Management
  - [ ] View all orders
  - [ ] Update status
  - [ ] Process refunds

- [ ] User Management
  - [ ] View all users
  - [ ] User activity
  - [ ] Manage access

- [ ] Reports
  - [ ] Sales by category
  - [ ] Payment method breakdown
  - [ ] Revenue trends

---

## Phase 9: Testing

### Unit Tests
- [ ] User service tests
- [ ] Product service tests
- [ ] Cart service tests
- [ ] Order service tests
- [ ] Payment logic tests

### Integration Tests
- [ ] User registration flow
- [ ] Product search & filter
- [ ] Cart operations
- [ ] Complete order flow
- [ ] Payment processing

### API Testing
- [ ] Test all endpoints
- [ ] Test error cases
- [ ] Test authentication
- [ ] Test authorization
- [ ] Load testing

**Tools**: Jest, Supertest, Postman

---

## Phase 10: Deployment & Security

### Security (CRITICAL)
- [ ] Input validation on all endpoints
- [ ] SQL injection prevention (parameterized queries)
- [ ] CSRF protection
- [ ] XSS prevention
- [ ] Rate limiting
- [ ] HTTPS/TLS
- [ ] Secure password hashing (bcrypt)
- [ ] JWT expiration
- [ ] Secrets management
- [ ] Environment variables

### Performance
- [ ] Database query optimization
- [ ] Caching strategy
- [ ] API response compression
- [ ] Database connection pooling
- [ ] Load testing

### Deployment
- [ ] Production docker-compose setup
- [ ] Environment configuration
- [ ] Database backups
- [ ] Monitoring & logging
- [ ] Error tracking
- [ ] Uptime monitoring

### Frontend Integration
- [ ] CORS configuration
- [ ] API documentation
- [ ] Error codes/messages standardization
- [ ] Rate limiting headers

---

## Important SQL Queries Reference

See [SQL_REFERENCE.md](SQL_REFERENCE.md) for:
- Common product queries
- Cart operations
- Order processing
- Analytics queries
- Data integrity checks

---

## Database Verification Commands

```bash
# Connect to database
psql -h localhost -U daraz_user -d daraz_db

# List all tables
\dt

# Describe a table
\d products

# Check users
SELECT * FROM users;

# Check products
SELECT * FROM products;

# Check sample order
SELECT o.*, u.name, u.email FROM orders o 
JOIN users u ON o.user_id = u.id;

# Count records
SELECT 
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM products) as products,
  (SELECT COUNT(*) FROM orders) as orders,
  (SELECT COUNT(*) FROM cart_items) as cart_items;
```

---

## Development Tips

### 💡 Best Practices
1. Use parameterized queries to prevent SQL injection
2. Hash passwords with bcrypt
3. Use JWT for authentication
4. Validate all user inputs
5. Use transactions for multi-step operations
6. Add proper error handling
7. Log important operations
8. Use environment variables for config
9. Document API endpoints
10. Test frequently

### 🔍 Debugging
- Use `console.log()` or proper logger
- Enable query logging in development
- Use Postman/Thunder Client for API testing
- Check database with `psql`
- Monitor Docker logs: `docker compose logs -f`

### 📚 Resources
- Express.js documentation
- PostgreSQL documentation
- Node.js best practices
- SQL query optimization
- API design patterns

---

## Progress Notes

### Completed ✅
- Database schema design
- All tables created
- Seed data prepared
- Docker configuration
- Documentation

### In Progress 🔄
- (Your current phase)

### To Do 📋
- (Upcoming phases)

---

**Last Updated**: March 18, 2026
**Project**: Daraz eCommerce Platform
**Status**: Phase 2 - Ready for Backend Development
