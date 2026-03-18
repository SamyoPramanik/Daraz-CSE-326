# Daraz eCommerce API Documentation

This document outlines the RESTful API endpoints for the Daraz eCommerce platform. 

## Base URL
`http://localhost:4000/api`

## Authentication & Authorization
All protected routes require a JWT token in the `Authorization` header.
**Header Format**: `Authorization: Bearer <your_jwt_token>`

### 1. Register User
Register a new customer.
- **URL**: `/auth/register`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "name": "John Doe",
      "email": "john@example.com",
      "password": "securepassword123",
      "phone": "01712345678"
  }
  ```
- **Response** (201 Created):
  ```json
  {
      "status": "success",
      "data": { "token": "eyJhbGciOiJIUzI1NiIsIn...", "user": { "id": "...", "name": "John Doe" } }
  }
  ```

### 2. Login User
Authenticate and get a JWT token.
- **URL**: `/auth/login`
- **Method**: `POST`
- **Body**:
  ```json
  {
      "email": "john@example.com",
      "password": "securepassword123"
  }
  ```
- **Response** (200 OK):
  ```json
  {
      "status": "success",
      "data": { "token": "eyJhbGciOiJIUzI1NiIsIn..." }
  }
  ```

---

## Products

### 3. Get Products (Search, Filter, Sort, Paginate)
Fetch products. Apply query parameters to get trending, flash sales, filter by categories, sort, and paginate.
- **URL**: `/products`
- **Method**: `GET`
- **Query Parameters**:
  - `page=1` : Page number for pagination (default: 1).
  - `limit=20` : Number of items per page (default: 20).
  - `flash_sale=true` : Get only flash sale products.
  - `trending=true` : Get trending products (e.g., highest sales/ratings).
  - `category=Electronics,Clothing` : Filter by one or multiple categories (comma-separated category names or IDs).
  - `search=phone` : Search by product name.
  - `sort=price_asc` | `price_desc` | `rating_desc` : Sort products.
- **Response**:
  ```json
  {
      "status": "success",
      "data": [
          {
              "id": "uuid",
              "name": "Samsung Galaxy S24",
              "image_url": "http://...",
              "price": 89999.00,
              "discount_price": 79999.00,
              "flash_sale": true,
              "rating": 4.5
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

### 4. View Single Product
Get complete details of a product, including its reviews.
- **URL**: `/products/:id`
- **Method**: `GET`
- **Response**:
  ```json
  {
      "status": "success",
      "data": {
          "id": "uuid",
          "name": "Samsung Galaxy S24",
          "description": "Latest flagship...",
          "price": 89999.00,
          "stock": 50,
          "rating": {
              "avg": 4.8,
              "total_reviews": 15
          },
          "reviews": [
              {
                  "id": 1,
                  "rating": 5,
                  "review": "Great phone!",
                  "user_name": "Ahmed",
                  "created_at": "2026-03-18T10:00:00Z"
              }
          ]
      }
  }
  ```

---

## Cart

### 5. View Cart
View all items currently in the authenticated user's cart.
- **URL**: `/cart`
- **Method**: `GET`
- **Authorization**: Required

### 6. Add Product to Cart
- **URL**: `/cart`
- **Method**: `POST`
- **Authorization**: Required
- **Body**:
  ```json
  {
      "productId": "uuid",
      "quantity": 1
  }
  ```

### 7. Update Cart Quantity
Increase or decrease the quantity of a specific cart item.
- **URL**: `/cart/:cartItemId`
- **Method**: `PUT`
- **Authorization**: Required
- **Body**:
  ```json
  {
      "quantity": 2
  }
  ```

### 8. Remove from Cart
- **URL**: `/cart/:cartItemId`
- **Method**: `DELETE`
- **Authorization**: Required

---

## Orders & Checkout

### 9. Checkout Order
Place an order using the items in the cart.
- **URL**: `/orders/checkout`
- **Method**: `POST`
- **Authorization**: Required
- **Body**:
  ```json
  {
      "payment_method": "bKash",
      "shipping_address": "123 Main St, Dhaka"
  }
  ```
- **Response** (201 Created):
  ```json
  {
      "status": "success",
      "message": "Order placed successfully",
      "data": { "orderId": "uuid", "total_amount": 89999.00 }
  }
  ```

### 10. View My Orders
Get a history of all orders placed by the authenticated user.
- **URL**: `/orders/me`
- **Method**: `GET`
- **Authorization**: Required
- **Response**:
  ```json
  {
      "status": "success",
      "data": [
          {
              "id": "uuid",
              "total_amount": 89999.00,
              "order_status": "Delivered",
              "created_at": "2026-03-15T10:00:00Z",
              "items": [
                  {
                      "order_item_id": 1,
                      "product_id": "uuid",
                      "name": "Samsung Galaxy S24",
                      "quantity": 1,
                      "price": 89999.00,
                      "rating": null,
                      "review": null
                  }
              ]
          }
      ]
  }
  ```

---

## Reviews & Ratings

*Note: As per the updated schema, reviews are attached directly to order items to ensure customers can only review what they have purchased.*

### 11. Rate and Review Ordered Product
Submit a rating and review for a specific product purchased in an order.
- **URL**: `/reviews`
- **Method**: `POST`
- **Authorization**: Required
- **Body**:
  ```json
  {
      "productId": "uuid",
      "rating": 5,
      "review": "Absolutely love it. Battery life is amazing!"
  }
  ```
- **Logic**: The server will verify if the authenticated user has an `order_item` for this `productId`. If so, it updates the `order_items` table with the rating and review.

### 12. Get All Reviews of a Product
- **URL**: `/reviews/product/:productId`
- **Method**: `GET`
- **Response**:
  ```json
  {
      "status": "success",
      "data": {
          "product_id": "uuid",
          "rating": {
              "avg": 4.5,
              "total_reviews": 12
          },
          "reviews": [
              {
                  "id": 1,
                  "user_name": "Fatima Khan",
                  "rating": 5,
                  "review": "Fast delivery!",
                  "created_at": "2026-03-16T12:00:00Z"
              }
          ]
      }
  }
  ```
