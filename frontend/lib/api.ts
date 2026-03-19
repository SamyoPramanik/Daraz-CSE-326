const BASE_URL = typeof window === 'undefined'
    ? (process.env.NEXT_PUBLIC_SERVER_URL || 'http://backend:4000')
    : ''; // Use relative /api for client-side which is proxied by Nginx

export async function fetchProducts(params: Record<string, string | null> = {}) {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
        if (value) query.append(key, value);
    });

    const url = `${BASE_URL}/api/products?${query.toString()}`;

    const res = await fetch(url, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch products');
    }

    return res.json();
}

export async function fetchTrendingProducts() {
    const url = `${BASE_URL}/api/products/trending`;

    const res = await fetch(url, {
        next: { revalidate: 60 },
    });

    if (!res.ok) {
        throw new Error('Failed to fetch trending products');
    }

    return res.json();
}

export async function fetchCategories(): Promise<string[]> {
    const url = `${BASE_URL}/api/products/categories`;

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
