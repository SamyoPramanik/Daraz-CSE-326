# Daraz eCommerce API Documentation

This document outlines the RESTful API endpoints for the Daraz eCommerce platform. 

## Base URL
Docker + Nginx: `http://localhost:9000/api`

Direct backend (without Nginx): `http://localhost:4000/api`

> Note: For internal SSR compatibility, backend also accepts legacy routes without `/api` prefix.

## Authentication & Authorization
All protected routes require a JWT token in the `Authorization` header.
**Header Format**: `Authorization: Bearer <your_jwt_token>`

Set `JWT_SECRET` in backend environment for production deployments.

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
      "data": {
          "token": "eyJhbGciOiJIUzI1NiIsIn...",
          "user": { "id": "...", "name": "John Doe", "email": "john@example.com" }
      }
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
- **Response**:
  ```json
  {
      "status": "success",
      "data": [
          {
              "id": 1,
              "cart_id": 1,
              "product_id": "uuid",
              "name": "Samsung Galaxy S24",
              "price": 89999.00,
              "quantity": 1,
              "total_price": 89999.00
          }
      ],
      "meta": {
          "cart_total": 89999.00
      }
  }
  ```

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
- **Response** (201 Created):
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
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Cart quantity updated",
      "data": {
          "id": 2,
          "product_id": "uuid",
          "quantity": 2
      }
  }
  ```

### 8. Remove from Cart
- **URL**: `/cart/:cartItemId`
- **Method**: `DELETE`
- **Authorization**: Required
- **Response**:
  ```json
  {
      "status": "success",
      "message": "Item removed from cart"
  }
  ```

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
- **Response** (201 Created):
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
          "review_date": "2026-03-18T10:00:00Z"
      }
  }
  ```

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

### 13. Delete My Review
Clear the rating/review from a previously reviewed order item.
- **URL**: `/reviews/:reviewId`
- **Method**: `DELETE`
- **Authorization**: Required
- **Response**:
    ```json
    {
            "status": "success",
            "message": "Review deleted successfully"
    }
    ```

---

## Standard API Responses

Our API uses conventional HTTP response codes to indicate the success or failure of an API request.

### 200 OK
Returned when a standard request is processed successfully.
```json
{
    "status": "success",
    "data": { "id": 1, "name": "Sample" }
}
```

### 201 Created
Returned when a new resource is successfully created (e.g., a new user registration, checkout, or review).
```json
{
    "status": "success",
    "message": "Resource created successfully",
    "data": { "id": "uuid" }
}
```

### 400 Bad Request
Returned when the request is malformed or invalid (e.g., missing payload fields, invalid data formats).
```json
{
    "status": "error",
    "message": "Rating must be between 1 and 5"
}
```

### 401 Unauthorized
Returned when authentication fails or the provided JWT token is invalid, missing, or expired.
```json
{
    "status": "error",
    "message": "Access denied. Invalid or missing token."
}
```

### 403 Forbidden
Returned when the user is authenticated but does not have permission to perform an action (e.g., reviewing an item they never purchased).
```json
{
    "status": "error",
    "message": "You can only review products you have ordered"
}
```

### 404 Not Found
Returned when the requested resource (e.g., product, user, review) does not exist.
```json
{
    "status": "error",
    "message": "Product not found"
}
```

### 500 Internal Server Error
Returned when an unexpected error occurs on the server side (e.g., database connection failure).
```json
{
    "status": "error",
    "message": "Failed to retrieve reviews",
    "error": "Internal details..."
}
```

## Quick API Testing

### Option A: Postman
1. Import collection: `postman/Daraz_API.postman_collection.json`
2. Import environment: `postman/Daraz_Local.postman_environment.json`
3. Set environment variable values:
    - `productId` (required for product/review/cart specific requests)
    - `reviewId` (for delete review endpoint)
4. Run `Auth > Login` first to auto-save `token`.

### Option B: One-command Smoke Test
From project root:

```bash
chmod +x backend/scripts/smoke_api.sh
./backend/scripts/smoke_api.sh
```

Optional env overrides:

```bash
BASE_URL=http://localhost:9000/api \
EMAIL=custom@example.com \
PASSWORD=securepassword123 \
./backend/scripts/smoke_api.sh
```
