# Daraz eCommerce — REST API Reference

> **Version:** 1.0.0  
> **Base URL (Docker + Nginx):** `http://localhost:9000/api`  
> **Base URL (Direct backend):** `http://localhost:4000`  
> **Content-Type:** `application/json`

---

## Table of Contents

- [Overview](#overview)
- [Authentication](#authentication)
  - [Register User](#1-register-user)
  - [Login User](#2-login-user)
  - [Admin Login](#3-admin-login)
  - [Logout](#4-logout)
- [Products](#products)
  - [List Products](#5-list-products)
  - [Get Product Details](#6-get-product-details)
  - [Get Categories](#7-get-categories)
  - [Get Trending Products](#8-get-trending-products)
  - [Create Product](#9-create-product)
  - [Update Product](#10-update-product)
  - [Delete Product](#11-delete-product)
- [Cart](#cart)
  - [View Cart](#12-view-cart)
  - [Add to Cart](#13-add-to-cart)
  - [Update Cart Item](#14-update-cart-item)
  - [Remove from Cart](#15-remove-from-cart)
- [Orders](#orders)
  - [Checkout](#16-checkout)
  - [View My Orders](#17-view-my-orders)
  - [Get Order by ID](#18-get-order-by-id)
- [Reviews](#reviews)
  - [Get Product Reviews](#19-get-product-reviews)
  - [Submit Review](#20-submit-review)
  - [Delete Review](#21-delete-review)
- [AI](#ai)
  - [Product Reliability Score](#22-product-reliability-score)
- [Admin](#admin)
  - [Dashboard Stats](#23-dashboard-stats)
  - [Sales Analytics](#24-sales-analytics)
  - [List Completed Orders](#25-list-completed-orders)
  - [Get Order Details (Admin)](#26-get-order-details-admin)
  - [List All Users](#27-list-all-users)
  - [Get User Details (Admin)](#28-get-user-details-admin)
- [Health Check](#health-check)
- [Response Envelope](#response-envelope)
- [Error Codes](#error-codes)
- [Testing](#testing)

---

## Overview

The Daraz API follows REST conventions and returns JSON for all responses. Every response is wrapped in a standard envelope containing a `status` field (`"success"` or `"error"`), optional `data`, `message`, and `meta` fields.

### Route Mounting

All routes are mounted on the Express server as follows:

| Prefix | Module |
|---|---|
| `/auth` | Authentication |
| `/products` | Products & Categories |
| `/cart` | Shopping Cart |
| `/orders` | Orders & Checkout |
| `/reviews` | Ratings & Reviews |
| `/ai` | AI-powered Features |
| `/admin` | Admin Dashboard |
| `/health` | Service Health |

> **Note:** When using Nginx (`http://localhost:9000`), all backend routes are prefixed with `/api`. For example: `http://localhost:9000/api/products`.

---

## Authentication

All protected endpoints require a valid JWT token sent in the `Authorization` header.

```
Authorization: Bearer <token>
```

Tokens are signed with `JWT_SECRET` and expire after **7 days** by default (`JWT_EXPIRES_IN`).

**JWT Payload:**
```json
{
    "id": "uuid",
    "email": "user@example.com",
    "name": "John Doe",
    "is_admin": false,
    "iat": 1711900800,
    "exp": 1712505600
}
```

**Authorization Levels:**

| Level | Header | Description |
|---|---|---|
| Public | None | No authentication required |
| User | `Bearer <token>` | Requires valid JWT (customer) |
| Admin | `Bearer <admin_token>` | Requires valid JWT with `is_admin: true` |

---

### 1. Register User

Create a new customer account.

```
POST /auth/register
```

**Authorization:** Public

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✔ | Full name |
| `email` | string | ✔ | Unique email address |
| `password` | string | ✔ | Password (hashed with bcrypt, cost 10) |
| `phone` | string | ✗ | Phone number |

```json
{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "securepassword123",
    "phone": "01712345678"
}
```

**Response — `201 Created`:**

```json
{
    "status": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "01712345678",
            "created_at": "2026-03-18T10:00:00.000Z"
        }
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Missing `name`, `email`, or `password` |
| `409` | Email already registered |

---

### 2. Login User

Authenticate a customer and receive a JWT token. Admin users are **blocked** from this endpoint.

```
POST /auth/login
```

**Authorization:** Public

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ✔ | Registered email |
| `password` | string | ✔ | Account password |

```json
{
    "email": "john@example.com",
    "password": "securepassword123"
}
```

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
            "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
            "name": "John Doe",
            "email": "john@example.com"
        }
    }
}
```

**Side Effects:** Sets user presence to **Online**.

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Missing `email` or `password` |
| `401` | Invalid email or password |
| `403` | Admin users must use `/auth/admin/login` |

---

### 3. Admin Login

Authenticate an admin user. Non-admin users are **blocked** from this endpoint.

```
POST /auth/admin/login
```

**Authorization:** Public

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `email` | string | ✔ | Admin email |
| `password` | string | ✔ | Admin password |

```json
{
    "email": "admin@daraz.com",
    "password": "adminpassword"
}
```

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "token": "eyJhbGciOiJIUzI1NiIsIn...",
        "user": {
            "id": "uuid",
            "name": "Admin",
            "email": "admin@daraz.com",
            "is_admin": true
        }
    }
}
```

**Side Effects:** Sets user presence to **Online**.

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Missing `email` or `password` |
| `401` | Invalid email or password |
| `403` | Non-admin users cannot use this endpoint |

---

### 4. Logout

Log out the current user and update presence status.

```
POST /auth/logout
```

**Authorization:** User

**Request Body:** None

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Logged out successfully"
}
```

**Side Effects:** Sets user presence to **Offline**.

---

## Products

### 5. List Products

Fetch products with search, filtering, sorting, and pagination.

```
GET /products
```

**Authorization:** Public

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `page` | integer | `1` | Page number |
| `limit` | integer | `20` | Items per page |
| `search` | string | — | Search by product name (case-insensitive, partial match) |
| `flash_sale` | `"true"` | — | Filter flash sale products only |
| `trending` | `"true"` | — | Sort by highest rating (overrides `sort`) |
| `category` | string | — | Filter by category IDs and/or names (comma-separated) |
| `sort` | string | `name` | Sort order: `price_asc`, `price_desc`, `rating_desc` |

**Category Filter Examples:**
- By ID: `?category=1,3`
- By name: `?category=Electronics,Clothing`
- Mixed: `?category=1,Clothing`

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid",
            "name": "Samsung Galaxy S24",
            "image_url": "https://...",
            "brand": "Samsung",
            "description": "Latest flagship...",
            "price": 89999.00,
            "discount_price": 79999.00,
            "stock": 50,
            "flash_sale": true,
            "category_id": 1,
            "category_name": "Electronics",
            "rating": 4.50,
            "review_count": 15,
            "sold_count": 120
        }
    ],
    "meta": {
        "total_items": 125,
        "total_pages": 7,
        "current_page": 1,
        "limit": 20
    }
}
```

> **Note:** `rating` and `discount_price` may be `null` if no reviews exist or no discount is set.

---

### 6. Get Product Details

Get full product information including reviews, rating summary, and total sold count.

```
GET /products/:id
```

**Authorization:** Public

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Product ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "image_url": "https://...",
        "brand": "Samsung",
        "description": "Latest flagship smartphone...",
        "price": 89999.00,
        "discount_price": 79999.00,
        "stock": 50,
        "flash_sale": true,
        "category_id": 1,
        "rating": {
            "avg": 4.80,
            "total_reviews": 15
        },
        "total_sold": 120,
        "reviews": [
            {
                "id": 1,
                "rating": 5,
                "review": "Great phone!",
                "created_at": "2026-03-18T10:00:00.000Z",
                "user_name": "Ahmed"
            }
        ]
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid UUID format |
| `404` | Product not found |

---

### 7. Get Categories

List all product categories sorted alphabetically.

```
GET /products/categories
```

**Authorization:** Public

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        { "id": 1, "name": "Automotive" },
        { "id": 2, "name": "Books" },
        { "id": 3, "name": "Electronics" }
    ]
}
```

---

### 8. Get Trending Products

Fetch the top 10 products ranked by average rating.

```
GET /products/trending
```

**Authorization:** Public

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid",
            "name": "Samsung Galaxy S24",
            "image_url": "https://...",
            "brand": "Samsung",
            "description": "Latest flagship...",
            "price": 89999.00,
            "discount_price": 79999.00,
            "flash_sale": true,
            "category_id": 1,
            "category_name": "Electronics",
            "rating": 4.80
        }
    ]
}
```

---

### 9. Create Product

Add a new product to the catalog. Duplicate detection is performed on `(name, category_id, brand)`.

```
POST /products
```

**Authorization:** Admin

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✔ | Product name |
| `image_url` | string | ✔ | Product image URL |
| `price` | number | ✔ | Base price (≥ 0) |
| `category_id` | integer | ✔ | Foreign key to categories table |
| `brand` | string | ✗ | Brand name |
| `description` | string | ✗ | Product description (supports HTML) |
| `discount_price` | number | ✗ | Discounted price (must be ≤ `price`) |
| `stock` | integer | ✗ | Stock count (default: `0`) |
| `flash_sale` | boolean | ✗ | Flash sale flag (default: `false`) |

```json
{
    "name": "Samsung Galaxy S24",
    "image_url": "https://example.com/image.jpg",
    "brand": "Samsung",
    "description": "<h2>Latest flagship</h2><p>Amazing phone...</p>",
    "price": 89999.00,
    "discount_price": 79999.00,
    "stock": 50,
    "flash_sale": true,
    "category_id": 1
}
```

**Response — `201 Created`:**

```json
{
    "status": "success",
    "message": "Product created successfully",
    "data": {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "image_url": "https://example.com/image.jpg",
        "brand": "Samsung",
        "description": "...",
        "price": 89999.00,
        "discount_price": 79999.00,
        "stock": 50,
        "flash_sale": true,
        "category_id": 1
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Missing required fields or invalid values |
| `401` | No token / invalid token |
| `403` | Not an admin |
| `404` | Category not found |
| `409` | Duplicate product (same name + category + brand) |

---

### 10. Update Product

Partially update a product. Only specified fields are updated; omitted fields retain their current values.

```
PUT /products/:id
```

**Authorization:** Admin

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Product ID |

**Request Body:** Same fields as [Create Product](#9-create-product) — all optional.

```json
{
    "price": 84999.00,
    "stock": 45
}
```

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Product updated successfully",
    "data": {
        "id": "uuid",
        "name": "Samsung Galaxy S24",
        "image_url": "https://example.com/image.jpg",
        "brand": "Samsung",
        "description": "...",
        "price": 84999.00,
        "discount_price": 79999.00,
        "stock": 45,
        "flash_sale": true,
        "category_id": 1
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid UUID or field values |
| `404` | Product or category not found |
| `409` | Update would create a duplicate product |

---

### 11. Delete Product

Permanently delete a product and all associated data (cascades to cart items, order items, bookings).

```
DELETE /products/:id
```

**Authorization:** Admin

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Product ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Product deleted successfully",
    "data": {
        "id": "uuid",
        "name": "Samsung Galaxy S24"
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid UUID |
| `404` | Product not found |

---

## Cart

All cart endpoints require authentication. A cart is automatically created for the user on first access.

### 12. View Cart

Retrieve all items in the authenticated user's cart with computed totals.

```
GET /cart
```

**Authorization:** User

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        {
            "id": 1,
            "cart_id": 1,
            "product_id": "uuid",
            "name": "Samsung Galaxy S24",
            "image_url": "https://...",
            "price": 89999.00,
            "discount_price": 79999.00,
            "stock": 50,
            "quantity": 2,
            "total_price": 159998.00
        }
    ],
    "meta": {
        "cart_total": 159998.00
    }
}
```

> **Note:** `total_price` per item uses `discount_price` when available, otherwise `price`.

---

### 13. Add to Cart

Add a product to the cart. If the product already exists in the cart, quantities are **merged** (incremented).

```
POST /cart
```

**Authorization:** User

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `productId` | UUID | ✔ | Product ID to add |
| `quantity` | integer | ✗ | Quantity to add (default: `1`, must be ≥ 1) |

```json
{
    "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "quantity": 1
}
```

**Response — `201 Created`:**

```json
{
    "status": "success",
    "message": "Product added to cart",
    "data": {
        "id": 2,
        "product_id": "uuid",
        "quantity": 1
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid `productId` or `quantity`, or quantity exceeds stock |
| `404` | Product not found |

---

### 14. Update Cart Item

Set the quantity of a specific cart item. Replaces (does not increment) the existing quantity.

```
PUT /cart/:id
```

**Authorization:** User

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | integer | Cart item ID |

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `quantity` | integer | ✔ | New quantity (must be ≥ 1) |

```json
{
    "quantity": 3
}
```

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Cart quantity updated",
    "data": {
        "id": 2,
        "product_id": "uuid",
        "quantity": 3
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid quantity or exceeds available stock |
| `404` | Cart item not found (or belongs to another user) |

---

### 15. Remove from Cart

Remove an item from the cart.

```
DELETE /cart/:id
```

**Authorization:** User

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | integer | Cart item ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Item removed from cart"
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `404` | Cart item not found |

---

## Orders

### 16. Checkout

Place an order from the current cart contents. This operation is **transactional** — it atomically:

1. Validates all stock levels
2. Creates the order and order items
3. Deducts stock from products
4. Clears the cart

```
POST /orders/checkout
```

**Authorization:** User

**Request Body:**

| Field | Type | Required | Description |
|---|---|---|---|
| `payment_method` | string | ✔ | Payment method (e.g., `"bKash"`, `"Cash on Delivery"`) |
| `shipping_address` | string | ✔ | Delivery address |

```json
{
    "payment_method": "bKash",
    "shipping_address": "123 Main St, Dhaka"
}
```

**Response — `201 Created`:**

```json
{
    "status": "success",
    "message": "Order placed successfully",
    "data": {
        "orderId": "uuid",
        "total_amount": 159998.00
    }
}
```

> **Note:** Orders are immediately set to `payment_status: "Paid"` and `order_status: "Delivered"`. Product prices use `discount_price` when available.

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Missing fields, empty cart, or insufficient stock |

---

### 17. View My Orders

Get the authenticated user's order history with all order items.

```
GET /orders/me
```

**Authorization:** User

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid",
            "total_amount": 159998.00,
            "order_status": "Delivered",
            "created_at": "2026-03-15T10:00:00.000Z",
            "order_items": [
                {
                    "id": 1,
                    "product_id": "uuid",
                    "product_name": "Samsung Galaxy S24",
                    "image_url": "https://...",
                    "quantity": 2,
                    "price": 79999.00,
                    "rating": null,
                    "review": null,
                    "review_date": null
                }
            ]
        }
    ]
}
```

> **Note:** `GET /orders` is also available as an alias and returns the same response.

---

### 18. Get Order by ID

Get detailed information for a specific order, including payment and shipping details.

```
GET /orders/:id
```

**Authorization:** User (owner only)

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Order ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "total_amount": 159998.00,
        "order_status": "Delivered",
        "payment_method": "bKash",
        "payment_status": "Paid",
        "shipping_address": "123 Main St, Dhaka",
        "created_at": "2026-03-15T10:00:00.000Z",
        "order_items": [
            {
                "id": 1,
                "product_id": "uuid",
                "product_name": "Samsung Galaxy S24",
                "image_url": "https://...",
                "quantity": 2,
                "price": 79999.00,
                "rating": 5,
                "review": "Great phone!",
                "review_date": "2026-03-18T10:00:00.000Z"
            }
        ]
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `404` | Order not found or does not belong to the user |

---

## Reviews

Reviews are attached to `order_items` to ensure **purchase-verified** reviews only. Each user can submit one review per product.

### 19. Get Product Reviews

Fetch all reviews for a product with rating summary.

```
GET /reviews/product/:productId
```

**Authorization:** Public

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `productId` | UUID | Product ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "product_id": "uuid",
        "rating": {
            "avg": 4.50,
            "total_reviews": 12
        },
        "reviews": [
            {
                "id": 1,
                "user_name": "Fatima Khan",
                "rating": 5,
                "review": "Fast delivery!",
                "created_at": "2026-03-16T12:00:00.000Z"
            }
        ]
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid UUID format |

---

### 20. Submit Review

Rate and review a purchased product. The server verifies the user has an `order_item` for this product.

```
POST /reviews
```

**Authorization:** User

**Request Body:**

| Field | Type | Required | Constraints |
|---|---|---|---|
| `productId` | UUID | ✔ | Must match a product the user has ordered |
| `rating` | integer | ✔ | `1` – `5` |
| `review` | string | ✗ | Review text body |

```json
{
    "productId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
    "rating": 5,
    "review": "Absolutely love it. Battery life is amazing!"
}
```

**Response — `201 Created`:**

```json
{
    "status": "success",
    "message": "Review created/updated successfully",
    "data": {
        "id": 1,
        "order_id": "uuid",
        "product_id": "uuid",
        "quantity": 1,
        "price": 89999.00,
        "rating": 5,
        "review": "Absolutely love it. Battery life is amazing!",
        "review_date": "2026-03-18T10:00:00.000Z"
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid `productId`, rating out of range, or already reviewed |
| `403` | User has not ordered this product |

---

### 21. Delete Review

Clear a rating and review from a previously reviewed order item.

```
DELETE /reviews/:reviewId
```

**Authorization:** User (owner only)

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `reviewId` | integer | Order item ID (the review's ID) |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Review deleted successfully"
}
```

> **Note:** This does not delete the order item; it sets `rating`, `review`, and `review_date` to `NULL`.

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid `reviewId` |
| `404` | Review not found or belongs to another user |

---

## AI

### 22. Product Reliability Score

Generate an AI-powered reliability score for a product based on customer reviews. Uses [Groq API](https://groq.com/) (LLaMA 3.1 8B) for analysis, with an automatic fallback to a basic calculation if the AI service is unavailable.

```
GET /ai/reliability/:productId
```

**Authorization:** Public

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `productId` | UUID | Product ID |

**Response — `200 OK` (AI analysis):**

```json
{
    "status": "success",
    "data": {
        "reliability_score": 87,
        "confidence": "high",
        "reasoning": "Strong positive sentiment across reviews with consistent praise for build quality.",
        "strengths": "Customers highlight fast delivery and excellent battery life.",
        "concerns": "Minor complaints about screen brightness in direct sunlight.",
        "recommendation": "Highly recommended based on 15 verified customer reviews.",
        "metadata": {
            "total_reviews": 15,
            "average_rating": 4.50,
            "reviews_with_text": 12,
            "generated_at": "2026-03-18T10:00:00.000Z"
        }
    }
}
```

**Response — `200 OK` (fallback / no reviews):**

```json
{
    "status": "success",
    "data": {
        "reliability_score": 0,
        "confidence": "low",
        "reasoning": "No customer reviews available yet",
        "summary": "This product has no reviews to analyze"
    }
}
```

**Fallback Behavior:**

| Condition | Behavior |
|---|---|
| No reviews | Returns score `0` with `"low"` confidence |
| Groq API timeout (default: 5s) | Falls back to basic rating-based calculation |
| Groq API error | Falls back to basic rating-based calculation |

**Environment Variables:**

| Variable | Default | Description |
|---|---|---|
| `GROQ_API_KEY` | — | Groq API key (required for AI analysis) |
| `AI_TIMEOUT_MS` | `5000` | Timeout in ms before falling back |

---

## Admin

All admin endpoints require a valid JWT token with `is_admin: true`. The admin middleware returns `401` for missing/invalid tokens and `403` for non-admin users.

### 23. Dashboard Stats

Get platform-wide summary statistics.

```
GET /admin/stats
```

**Authorization:** Admin

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "total_users": 1250,
        "total_orders": 3400,
        "total_products": 560,
        "total_revenue": 4500000.00
    }
}
```

> **Note:** `total_revenue` represents the platform's 1% commission on gross order amount. `total_users` excludes admin accounts.

---

### 24. Sales Analytics

Get detailed sales analytics with daily breakdown and top products for a given date range.

```
GET /admin/analytics
```

**Authorization:** Admin

**Query Parameters:**

| Parameter | Type | Default | Description |
|---|---|---|---|
| `start_date` | `YYYY-MM-DD` | 30 days ago | Start of date range |
| `end_date` | `YYYY-MM-DD` | Today | End of date range |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "range": {
            "start_date": "2026-03-01",
            "end_date": "2026-03-30"
        },
        "summary": {
            "total_orders": 340,
            "gross_revenue": 4500000.00,
            "commission_revenue": 45000.00
        },
        "daily": [
            {
                "date": "2026-03-01",
                "order_count": 12,
                "gross_revenue": 150000.00,
                "commission_revenue": 1500.00
            }
        ],
        "top_products": [
            {
                "id": "uuid",
                "name": "Samsung Galaxy S24",
                "brand": "Samsung",
                "units_sold": 120,
                "gross_sales": 9599880.00,
                "commission_revenue": 95998.80
            }
        ]
    }
}
```

> **Note:** `commission_revenue` = `gross_revenue × 0.01` (1% platform fee). `top_products` returns up to 10 entries sorted by units sold.

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | `start_date` is later than `end_date` |

---

### 25. List Completed Orders

Get all orders with status `"Delivered"` or `"Completed"`. Optionally filter by customer name.

```
GET /admin/orders
```

**Authorization:** Admin

**Query Parameters:**

| Parameter | Type | Required | Description |
|---|---|---|---|
| `name` | string | ✗ | Filter by customer name (case-insensitive, partial match) |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid",
            "user_id": "uuid",
            "user_name": "John Doe",
            "user_email": "john@example.com",
            "total_amount": 159998.00,
            "payment_method": "bKash",
            "payment_status": "Paid",
            "order_status": "Delivered",
            "shipping_address": "123 Main St, Dhaka",
            "created_at": "2026-03-15T10:00:00.000Z",
            "total_items": 3
        }
    ]
}
```

---

### 26. Get Order Details (Admin)

Get full order details including customer info and all line items.

```
GET /admin/orders/:id
```

**Authorization:** Admin

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | Order ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "user": {
            "id": "uuid",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "01712345678"
        },
        "total_amount": 159998.00,
        "payment_method": "bKash",
        "payment_status": "Paid",
        "order_status": "Delivered",
        "shipping_address": "123 Main St, Dhaka",
        "created_at": "2026-03-15T10:00:00.000Z",
        "order_items": [
            {
                "id": 1,
                "product_id": "uuid",
                "product_name": "Samsung Galaxy S24",
                "brand": "Samsung",
                "image_url": "https://...",
                "quantity": 2,
                "price": 79999.00,
                "rating": 5,
                "review": "Great phone!",
                "review_date": "2026-03-18T10:00:00.000Z"
            }
        ]
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid UUID |
| `404` | Order not found |

---

### 27. List All Users

Get all non-admin users with activity stats and online/offline status.

```
GET /admin/users
```

**Authorization:** Admin

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": [
        {
            "id": "uuid",
            "name": "John Doe",
            "email": "john@example.com",
            "phone": "01712345678",
            "created_at": "2026-03-01T10:00:00.000Z",
            "total_orders": 5,
            "total_spent": 450000.00,
            "last_order_at": "2026-03-15T10:00:00.000Z",
            "last_cart_at": "2026-03-18T09:00:00.000Z",
            "last_seen_at": "2026-03-18T10:00:00.000Z",
            "last_activity_at": "2026-03-18T10:00:00.000Z",
            "status": "Online"
        }
    ]
}
```

> **Note:** A user is considered `"Online"` if `is_online = true` AND `last_seen_at` is within the last 15 minutes. Otherwise, they are `"Offline"`.

---

### 28. Get User Details (Admin)

Get detailed user profile with recent order history (up to 20 orders).

```
GET /admin/users/:id
```

**Authorization:** Admin

**Path Parameters:**

| Parameter | Type | Description |
|---|---|---|
| `id` | UUID | User ID |

**Response — `200 OK`:**

```json
{
    "status": "success",
    "data": {
        "id": "uuid",
        "name": "John Doe",
        "email": "john@example.com",
        "phone": "01712345678",
        "created_at": "2026-03-01T10:00:00.000Z",
        "last_seen_at": "2026-03-18T10:00:00.000Z",
        "status": "Online",
        "total_orders": 5,
        "total_spent": 450000.00,
        "last_order_at": "2026-03-15T10:00:00.000Z",
        "last_cart_at": "2026-03-18T09:00:00.000Z",
        "recent_orders": [
            {
                "id": "uuid",
                "total_amount": 159998.00,
                "payment_status": "Paid",
                "order_status": "Delivered",
                "created_at": "2026-03-15T10:00:00.000Z",
                "total_items": 3
            }
        ]
    }
}
```

**Error Responses:**

| Status | Condition |
|---|---|
| `400` | Invalid UUID |
| `404` | User not found (or is an admin) |

---

## Health Check

Verify that the backend server and database connection are operational.

```
GET /health
```

**Authorization:** Public

**Response — `200 OK`:**

```json
{
    "status": "success",
    "message": "Daraz platform server is running!",
    "db_time": "2026-03-18T10:00:00.000Z"
}
```

**Response — `500 Internal Server Error`:**

```json
{
    "status": "error",
    "message": "Database connection failed",
    "error": "connection refused"
}
```

---

## Response Envelope

All API responses follow a consistent JSON envelope:

### Success Response

```json
{
    "status": "success",
    "message": "Optional success message",
    "data": { },
    "meta": { }
}
```

| Field | Type | Present | Description |
|---|---|---|---|
| `status` | `"success"` | Always | Indicates success |
| `message` | string | Sometimes | Human-readable message (on create/update/delete) |
| `data` | object \| array | Usually | Response payload |
| `meta` | object | Sometimes | Pagination info, totals, etc. |

### Error Response

```json
{
    "status": "error",
    "message": "Human-readable error description",
    "error": "Technical details (development only)"
}
```

| Field | Type | Present | Description |
|---|---|---|---|
| `status` | `"error"` | Always | Indicates failure |
| `message` | string | Always | User-facing error message |
| `error` | string | On 500s | Internal error details (debug only) |

---

## Error Codes

| HTTP Code | Meaning | Common Causes |
|---|---|---|
| `400` | **Bad Request** | Missing/invalid fields, validation failures, quantity exceeds stock |
| `401` | **Unauthorized** | No token, expired token, invalid token |
| `403` | **Forbidden** | Non-admin accessing admin routes, reviewing unordered product, admin using customer login |
| `404` | **Not Found** | Resource doesn't exist (product, order, user, cart item, category) |
| `409` | **Conflict** | Duplicate email on registration, duplicate product on create/update |
| `500` | **Internal Server Error** | Database failures, unhandled exceptions |

---

## Testing

### Option A: Postman Collection

1. Import collection: `postman/Daraz_API.postman_collection.json`
2. Import environment: `postman/Daraz_Local.postman_environment.json`
3. Set environment variables:
   - `productId` — for product/review/cart specific requests
   - `reviewId` — for delete review endpoint
4. Run **Auth → Login** first to auto-save the `token` variable

### Option B: Smoke Test Script

From project root:

```bash
chmod +x backend/scripts/smoke_api.sh
./backend/scripts/smoke_api.sh
```

With custom configuration:

```bash
BASE_URL=http://localhost:9000/api \
EMAIL=custom@example.com \
PASSWORD=securepassword123 \
./backend/scripts/smoke_api.sh
```

### Option C: cURL Quick Start

```bash
# Health check
curl http://localhost:9000/api/health

# Register
curl -X POST http://localhost:9000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"pass123"}'

# Login (save token)
TOKEN=$(curl -s -X POST http://localhost:9000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"pass123"}' | jq -r '.data.token')

# Browse products
curl http://localhost:9000/api/products?limit=5

# Add to cart (authenticated)
curl -X POST http://localhost:9000/api/cart \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{"productId":"<product-uuid>","quantity":1}'
```
