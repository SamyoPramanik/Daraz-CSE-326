#!/usr/bin/env bash
set -euo pipefail

BASE_URL="${BASE_URL:-http://localhost:4000/api}"
NAME="${NAME:-API Smoke User}"
EMAIL="${EMAIL:-smoke.$(date +%s)@example.com}"
PASSWORD="${PASSWORD:-securepassword123}"
PHONE="${PHONE:-01712345678}"
PAYMENT_METHOD="${PAYMENT_METHOD:-bKash}"
SHIPPING_ADDRESS="${SHIPPING_ADDRESS:-123 Main St, Dhaka}"

json_get() {
  local json="$1"
  local path="$2"
  printf '%s' "$json" | node -e '
    const fs = require("fs");
    const input = fs.readFileSync(0, "utf8");
    const path = process.argv[1].split(".");
    const data = JSON.parse(input);
    let cur = data;
    for (const key of path) {
      if (cur == null || !(key in cur)) {
        process.exit(1);
      }
      cur = cur[key];
    }
    if (typeof cur === "object") {
      console.log(JSON.stringify(cur));
    } else {
      console.log(String(cur));
    }
  ' "$path"
}

request() {
  local method="$1"
  local url="$2"
  local body="${3:-}"
  local token="${4:-}"

  if [[ -n "$body" && -n "$token" ]]; then
    curl -sS -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $token" \
      -d "$body"
  elif [[ -n "$body" ]]; then
    curl -sS -X "$method" "$url" \
      -H "Content-Type: application/json" \
      -d "$body"
  elif [[ -n "$token" ]]; then
    curl -sS -X "$method" "$url" \
      -H "Authorization: Bearer $token"
  else
    curl -sS -X "$method" "$url"
  fi
}

echo "== 1) Register user =="
REGISTER_PAYLOAD=$(cat <<JSON
{"name":"$NAME","email":"$EMAIL","password":"$PASSWORD","phone":"$PHONE"}
JSON
)
REGISTER_RESPONSE=$(request POST "$BASE_URL/auth/register" "$REGISTER_PAYLOAD")
echo "$REGISTER_RESPONSE"

echo "== 2) Login user =="
LOGIN_PAYLOAD=$(cat <<JSON
{"email":"$EMAIL","password":"$PASSWORD"}
JSON
)
LOGIN_RESPONSE=$(request POST "$BASE_URL/auth/login" "$LOGIN_PAYLOAD")
echo "$LOGIN_RESPONSE"
TOKEN=$(json_get "$LOGIN_RESPONSE" "data.token")

echo "== 3) Get products and pick first product =="
PRODUCTS_RESPONSE=$(request GET "$BASE_URL/products?page=1&limit=5")
echo "$PRODUCTS_RESPONSE"
PRODUCT_ID=$(printf '%s' "$PRODUCTS_RESPONSE" | node -e '
  const fs = require("fs");
  const d = JSON.parse(fs.readFileSync(0, "utf8"));
  if (!d.data || !d.data.length) process.exit(1);
  console.log(d.data[0].id);
')

echo "== 4) Add product to cart =="
ADD_CART_PAYLOAD=$(cat <<JSON
{"productId":"$PRODUCT_ID","quantity":1}
JSON
)
ADD_CART_RESPONSE=$(request POST "$BASE_URL/cart" "$ADD_CART_PAYLOAD" "$TOKEN")
echo "$ADD_CART_RESPONSE"
CART_ITEM_ID=$(json_get "$ADD_CART_RESPONSE" "data.id")

echo "== 5) View cart =="
VIEW_CART_RESPONSE=$(request GET "$BASE_URL/cart" "" "$TOKEN")
echo "$VIEW_CART_RESPONSE"

echo "== 6) Update cart quantity =="
UPDATE_CART_PAYLOAD='{"quantity":2}'
UPDATE_CART_RESPONSE=$(request PUT "$BASE_URL/cart/$CART_ITEM_ID" "$UPDATE_CART_PAYLOAD" "$TOKEN")
echo "$UPDATE_CART_RESPONSE"

echo "== 7) Checkout =="
CHECKOUT_PAYLOAD=$(cat <<JSON
{"payment_method":"$PAYMENT_METHOD","shipping_address":"$SHIPPING_ADDRESS"}
JSON
)
CHECKOUT_RESPONSE=$(request POST "$BASE_URL/orders/checkout" "$CHECKOUT_PAYLOAD" "$TOKEN")
echo "$CHECKOUT_RESPONSE"

echo "== 8) View my orders =="
ORDERS_RESPONSE=$(request GET "$BASE_URL/orders/me" "" "$TOKEN")
echo "$ORDERS_RESPONSE"

ORDER_ITEM_ID=$(printf '%s' "$ORDERS_RESPONSE" | node -e '
  const fs = require("fs");
  const d = JSON.parse(fs.readFileSync(0, "utf8"));
  if (!d.data || !d.data.length || !d.data[0].items || !d.data[0].items.length) process.exit(1);
  console.log(d.data[0].items[0].order_item_id);
')

echo "== 9) Post review =="
REVIEW_PAYLOAD=$(cat <<JSON
{"productId":"$PRODUCT_ID","rating":5,"review":"Smoke test review"}
JSON
)
REVIEW_RESPONSE=$(request POST "$BASE_URL/reviews" "$REVIEW_PAYLOAD" "$TOKEN")
echo "$REVIEW_RESPONSE"

echo "== 10) Get product reviews =="
GET_REVIEWS_RESPONSE=$(request GET "$BASE_URL/reviews/product/$PRODUCT_ID")
echo "$GET_REVIEWS_RESPONSE"

echo "== 11) Delete review =="
DELETE_REVIEW_RESPONSE=$(request DELETE "$BASE_URL/reviews/$ORDER_ITEM_ID" "" "$TOKEN")
echo "$DELETE_REVIEW_RESPONSE"

echo "✅ Smoke test complete"
