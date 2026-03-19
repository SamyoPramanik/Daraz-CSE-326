// Server-side (SSR): call backend directly — no Nginx, so NO /api prefix
// Client-side (browser): use /api so Nginx can strip it before forwarding to backend
const BASE_URL = typeof window === 'undefined'
    ? (process.env.NEXT_INTERNAL_SERVER_URL || 'http://backend:4000')
    : '/api';

export async function fetchProducts(params: Record<string, string | null> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });

    const url = `${BASE_URL}/products?${query.toString()}`;

    const res = await fetch(url, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }

    return res.json();
}

export async function fetchTrendingProducts() {
    const url = `${BASE_URL}/products/trending`;

    const res = await fetch(url, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch trending products');
    }

    return res.json();
}

export async function fetchCategories(): Promise<string[]> {
    const url = `${BASE_URL}/products/categories`;

    const res = await fetch(url, {
        next: { revalidate: 3600 }, // Cache categories for 1 hour
    });

    if (!res.ok) {
        // fallback to static categories if endpoint fails
        return ["Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports"];
    }

    const json = await res.json();
    return json.data as string[];
}

export async function fetchProduct(id: string) {
    const url = `${BASE_URL}/products/${id}`;

    const res = await fetch(url, {
        next: { revalidate: 30 },
    });

    if (!res.ok) {
        if (res.status === 404) return null;
        throw new Error('Failed to fetch product');
    }

    const json = await res.json();
    return json.data;
}
