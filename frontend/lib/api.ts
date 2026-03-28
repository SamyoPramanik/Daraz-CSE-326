// Server-side (SSR): call backend directly — no Nginx, so NO /api prefix
// Client-side (browser): use /api so Nginx can strip it before forwarding to backend
const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_INTERNAL_SERVER_URL || "http://backend:4000"
    : "/api";

export async function fetchProducts(
  params: Record<string, string | null> = {},
) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) query.append(key, value);
  });

  const url = `${BASE_URL}/products?${query.toString()}`;

  const res = await fetch(url, {
    next: { revalidate: 1 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }

  return res.json();
}

export async function fetchTrendingProducts() {
  const url = `${BASE_URL}/products/trending`;

  const res = await fetch(url, {
    next: { revalidate: 1 },
  });

  if (!res.ok) {
    throw new Error("Failed to fetch trending products");
  }

  return res.json();
}

export interface Category {
  id: number;
  name: string;
}

export async function fetchCategories(): Promise<Category[]> {
  const url = `${BASE_URL}/products/categories`;

  const res = await fetch(url, {
    next: { revalidate: 1 }, // Cache categories for 1 hour
  });

  if (!res.ok) {
    // fallback to static categories if endpoint fails
    return [
      { id: 1, name: "Electronics" },
      { id: 2, name: "Clothing" },
      { id: 3, name: "Home & Kitchen" },
      { id: 4, name: "Books" },
      { id: 5, name: "Beauty" },
      { id: 6, name: "Sports" },
    ];
  }

  const json = await res.json();
  return json.data as Category[];
}

export async function fetchProduct(id: string) {
  const url = `${BASE_URL}/products/${id}`;

  const res = await fetch(url, {
    next: { revalidate: 1 },
  });

  if (!res.ok) {
    if (res.status === 404) return null;
    throw new Error("Failed to fetch product");
  }

  const json = await res.json();
  return json.data;
}

// ============ CART API FUNCTIONS ============

export async function fetchCart() {
  const url = `${BASE_URL}/cart`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    throw new Error("Failed to fetch cart");
  }

  return res.json();
}

export async function updateCartItem(cartItemId: number, quantity: number) {
  const url = `${BASE_URL}/cart/${cartItemId}`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("Unauthorized - Please login");
  }

  const res = await fetch(url, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ quantity }),
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    throw new Error("Failed to update cart item");
  }

  return res.json();
}

export async function removeCartItem(cartItemId: number) {
  const url = `${BASE_URL}/cart/${cartItemId}`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("Unauthorized - Please login");
  }

  const res = await fetch(url, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    throw new Error("Failed to remove cart item");
  }

  return res.json();
}

export async function addToCart(productId: string, quantity: number) {
  const url = `${BASE_URL}/cart`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  console.log("[addToCart] Token:", token ? "Found" : "Not found");
  console.log("[addToCart] URL:", url);

  if (!token) {
    throw new Error("Unauthorized - Please login");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ productId, quantity }),
    cache: "no-store",
  });

  console.log("[addToCart] Response status:", res.status);

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to add item to cart");
  }

  return res.json();
}

// ============ ORDER API FUNCTIONS ============

export async function placeOrder(
  paymentMethod: string,
  shippingAddress: string,
) {
  const url = `${BASE_URL}/orders/checkout`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("Unauthorized - Please login");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      payment_method: paymentMethod,
      shipping_address: shippingAddress,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to place order");
  }

  return res.json();
}

export async function fetchOrders() {
  const url = `${BASE_URL}/orders`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    throw new Error("Failed to fetch orders");
  }

  return res.json();
}

export async function fetchOrderById(orderId: string | number) {
  const url = `${BASE_URL}/orders/${orderId}`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const res = await fetch(url, {
    method: "GET",
    headers,
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    if (res.status === 404) {
      throw new Error("Order not found");
    }
    throw new Error("Failed to fetch order");
  }

  return res.json();
}

// ============ REVIEW API FUNCTIONS ============

export async function fetchProductReviews(productId: string) {
  const url = `${BASE_URL}/reviews/product/${productId}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reviews");
  }

  return res.json();
}

export async function submitReview(
  productId: string,
  rating: number,
  review: string,
) {
  const url = `${BASE_URL}/reviews`;
  const token =
    typeof window !== "undefined" ? localStorage.getItem("token") : null;

  if (!token) {
    throw new Error("Unauthorized - Please login");
  }

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      productId,
      rating,
      review: review || null,
    }),
    cache: "no-store",
  });

  if (!res.ok) {
    if (res.status === 401) {
      throw new Error("Unauthorized - Please login");
    }
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || "Failed to submit review");
  }

  return res.json();
}

export async function fetchProductReliabilityScore(productId: string) {
  const url = `${BASE_URL}/ai/reliability/${productId}`;

  const res = await fetch(url, {
    method: "GET",
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch reliability score");
  }

  return res.json();
}
