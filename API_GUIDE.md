# API Endpoints

## Products

### Get All Products
```
GET /api/products
```
Returns all products list.

### Get Single Product with Reviews
```
GET /api/products/:id
```
Returns product details + average rating + all reviews

**Response**:
```json
{
    "status": "success",
    "data": {
        "id": "550e8400-e29b-41d4-a716-446655440000",
        "name": "Samsung Galaxy S24",
        "description": "Latest flagship smartphone...",
        "price": 89999.00,
        "discount_price": 79999.00,
        "stock": 50,
        "rating": {
            "avg": 4.5,
            "total_reviews": 5
        },
        "reviews": [
            {
                "id": 1,
                "user_name": "Ahmed Hassan",
                "rating": 5,
                "review": "Excellent product!",
                "created_at": "2026-03-18T10:30:00Z"
            }
        ]
    }
}
```

---

## Reviews

### Get Product Reviews
```
GET /api/reviews/product/:productId
```
Returns all reviews for a product with average rating.

### Create/Update Review
```
POST /api/reviews
```

**Body**:
```json
{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "productId": "550e8400-e29b-41d4-a716-446655440001",
    "rating": 5,
    "review": "Great product, highly recommend!"
}
```

**Response**:
```json
{
    "status": "success",
    "message": "Review created/updated successfully",
    "data": {
        "id": 1,
        "user_id": "550e8400-e29b-41d4-a716-446655440000",
        "product_id": "550e8400-e29b-41d4-a716-446655440001",
        "rating": 5,
        "review": "Great product, highly recommend!",
        "created_at": "2026-03-18T10:30:00Z"
    }
}
```

### Delete Review
```
DELETE /api/reviews/:reviewId
```

**Body**:
```json
{
    "userId": "550e8400-e29b-41d4-a716-446655440000"
}
```

---

## Examples

### View Product with Reviews
```bash
curl http://localhost:4000/api/products/550e8400-e29b-41d4-a716-446655440000
```

### Get Reviews for a Product
```bash
curl http://localhost:4000/api/reviews/product/550e8400-e29b-41d4-a716-446655440000
```

### Create a Review
```bash
curl -X POST http://localhost:4000/api/reviews \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "productId": "550e8400-e29b-41d4-a716-446655440001",
    "rating": 5,
    "review": "Excellent product!"
  }'
```

### Delete a Review
```bash
curl -X DELETE http://localhost:4000/api/reviews/1 \
  -H "Content-Type: application/json" \
  -d '{
    "userId": "550e8400-e29b-41d4-a716-446655440000"
  }'
```

---

## Key Features

✅ **View Product Details with Reviews** - When viewing a product, users see:
- Product info (name, description, price, stock)
- Average rating (e.g., 4.5 out of 5)
- Number of reviews
- All individual reviews with user names and dates

✅ **Create/Update Reviews** - Users can:
- Add a review with 1-5 star rating
- Update their existing review
- Add optional review text

✅ **View All Reviews** - Users can:
- See all reviews for a product
- See average rating and total review count
- See who reviewed it and when

✅ **Delete Reviews** - Users can:
- Delete their own review
- Only they can delete their review

---

**Implementation Status**: ✅ Complete
**Testing**: Use Postman or curl commands above
