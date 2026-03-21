"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/ProductCard";
import {
  ChevronDown,
  SlidersHorizontal,
  Loader2,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import { fetchProducts, fetchCategories } from "@/lib/api";

interface ProductSummary {
  id: string;
  name: string;
  price: number;
  discount_price: number | null;
  image_url: string;
  rating: number | null;
  stock: number;
}

interface CategoryItem {
  id: number;
  name: string;
}

function SearchContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // URL States
  const currentSearch = searchParams.get("search") || "";
  const currentSort = searchParams.get("sort") || "pop";
  const currentCategories = useMemo(
    () => searchParams.get("category")?.split(",").filter(Boolean) || [],
    [searchParams],
  );
  const currentFlashSale = searchParams.get("flash_sale") === "true";

  // Local States
  const [searchInput, setSearchInput] = useState(currentSearch);
  const [products, setProducts] = useState<ProductSummary[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);
  const currentPage = parseInt(searchParams.get("page") || "1");
  const [error, setError] = useState<string | null>(null);

  // Load categories on mount
  useEffect(() => {
    fetchCategories()
      .then(setCategories)
      .catch(() => {
        setCategories([
          { id: 1, name: "Electronics" },
          { id: 2, name: "Clothing" },
          { id: 3, name: "Home & Kitchen" },
          { id: 4, name: "Books" },
          { id: 5, name: "Beauty" },
          { id: 6, name: "Sports" },
        ]);
      });
  }, []);

  // Sync back to URL
  const updateQuery = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // reset page to 1 whenever filters change
      params.set("page", "1");
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  //pagination er jonne relevant function

  const updatePage = useCallback(
    (page: number) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("page", page.toString());
      router.push(`${pathname}?${params.toString()}`);
    },
    [searchParams, pathname, router],
  );

  // Handle Category Toggle
  const toggleCategory = (catId: number) => {
    let newCats = [...currentCategories];
    const catIdStr = catId.toString();
    if (newCats.includes(catIdStr)) {
      newCats = newCats.filter((c) => c !== catIdStr);
    } else {
      newCats.push(catIdStr);
    }
    updateQuery("category", newCats.length ? newCats.join(",") : null);
  };

  // Handle Flash Sale Toggle
  const toggleFlashSale = () => {
    updateQuery("flash_sale", currentFlashSale ? null : "true");
  };

  // Debounced Search execute
  useEffect(() => {
    const timeout = setTimeout(() => {
      if (searchInput !== currentSearch) {
        updateQuery("search", searchInput || null);
      }
    }, 500);
    return () => clearTimeout(timeout);
  }, [searchInput, currentSearch, updateQuery]);

  // Fetch Products when URL changes
  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const res = await fetchProducts({
          search: currentSearch,
          category: currentCategories.join(","),
          sort: currentSort,
          flash_sale: currentFlashSale ? "true" : null,
          limit: "20",
          page: currentPage.toString(),
        });
        setProducts(res.data || []);
        setTotalPages(res.meta?.total_pages || 1);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Failed to load products";
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, [
    currentSearch,
    currentSort,
    currentCategories,
    currentFlashSale,
    currentPage,
  ]);

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col md:flex-row gap-6">
        {/* Left Sidebar Filters */}
        <aside className="w-full md:w-64 flex-shrink-0">
          <div className="sticky top-24 rounded-lg border bg-white p-5 shadow-sm">
            <div className="mb-4 flex items-center gap-2 border-b pb-4 text-lg font-semibold">
              <SlidersHorizontal className="h-5 w-5 text-primary" />
              Filters
            </div>

            <div className="space-y-6">
              {/* Flash Sales Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Offers</h3>
                <label className="flex items-center gap-3 space-x-2 cursor-pointer">
                  <Checkbox
                    checked={currentFlashSale}
                    onCheckedChange={toggleFlashSale}
                  />
                  <span className="text-sm text-gray-700">Flash Sales</span>
                </label>
              </div>

              {/* Categories Filter */}
              <div>
                <h3 className="font-medium text-gray-900 mb-3">Categories</h3>
                <div className="flex flex-col gap-3">
                  {categories.map((cat) => (
                    <label
                      key={cat.id}
                      className="flex items-center gap-3 space-x-2 cursor-pointer"
                    >
                      <Checkbox
                        checked={currentCategories.includes(cat.id.toString())}
                        onCheckedChange={() => toggleCategory(cat.id)}
                      />
                      <span className="text-sm text-gray-700">{cat.name}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1">
          {/* Top Control Bar */}
          <div className="mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 rounded-lg border bg-white p-4 shadow-sm">
            <div className="w-full sm:w-1/2">
              <Input
                placeholder="Search products..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500 whitespace-nowrap">
                Sort by:
              </span>
              <div className="relative">
                <select
                  className="appearance-none rounded-md border border-gray-300 bg-white py-2 pl-3 pr-8 text-sm focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  value={currentSort}
                  onChange={(e) => updateQuery("sort", e.target.value)}
                >
                  <option value="pop">Popularity</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                  <option value="rating_desc">Top Rated</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-500">
                  <ChevronDown className="h-4 w-4" />
                </div>
              </div>
            </div>
          </div>

          {/* Active Filters Display */}
          {(currentCategories.length > 0 ||
            currentSearch ||
            currentFlashSale) && (
            <div className="mb-4 flex flex-wrap gap-2 text-sm">
              <span className="text-gray-500 mt-1">Active Filters:</span>
              {currentSearch && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-primary">
                  Search: &quot;{currentSearch}&quot;
                </span>
              )}
              {currentFlashSale && (
                <span className="rounded-full bg-orange-100 px-3 py-1 text-primary flex items-center gap-1">
                  Flash Sales
                  <button
                    onClick={toggleFlashSale}
                    className="ml-1 text-xl leading-none hover:text-red-500"
                  >
                    &times;
                  </button>
                </span>
              )}
              {currentCategories.map((catId) => {
                const category = categories.find(
                  (c) => c.id.toString() === catId,
                );
                return (
                  <span
                    key={catId}
                    className="rounded-full bg-orange-100 px-3 py-1 text-primary flex items-center gap-1"
                  >
                    {category?.name || catId}
                    <button
                      onClick={() => toggleCategory(parseInt(catId))}
                      className="ml-1 text-xl leading-none hover:text-red-500"
                    >
                      &times;
                    </button>
                  </span>
                );
              })}
            </div>
          )}

          {/* Product Grid */}
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p>Loading products...</p>
            </div>
          ) : error ? (
            <div className="p-10 text-center text-red-500 border border-red-100 bg-red-50 rounded-lg">
              {error}
            </div>
          ) : products.length === 0 ? (
            <div className="p-20 text-center text-gray-500 border border-dashed rounded-lg bg-white">
              <p className="text-lg font-medium">No products found</p>
              <p className="text-sm">
                Try adjusting your filters or search terms.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  name={product.name}
                  price={product.discount_price ?? product.price}
                  originalPrice={
                    product.discount_price ? product.price : undefined
                  }
                  imageUrl={product.image_url}
                  rating={Number(product.rating ?? 0)}
                  stock={product.stock}
                />
              ))}
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex items-center justify-center gap-1">
              <button
                onClick={() => updatePage(currentPage - 1)}
                disabled={currentPage === 1}
                className="flex items-center gap-1 px-3 h-9 rounded-md border text-sm hover:bg-orange-50 hover:border-primary hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(
                  (p) =>
                    p === 1 ||
                    p === totalPages ||
                    Math.abs(p - currentPage) <= 1,
                )
                .reduce<(number | string)[]>((acc, p, idx, arr) => {
                  if (idx > 0 && p - (arr[idx - 1] as number) > 1)
                    acc.push("...");
                  acc.push(p);
                  return acc;
                }, [])
                .map((p, idx) =>
                  p === "..." ? (
                    <span
                      key={`dots-${idx}`}
                      className="flex h-9 w-9 items-center justify-center text-gray-400"
                    >
                      ···
                    </span>
                  ) : (
                    <button
                      key={p}
                      onClick={() => updatePage(p as number)}
                      className={`h-9 w-9 rounded-md border text-sm transition ${
                        currentPage === p
                          ? "bg-primary text-white border-primary"
                          : "hover:bg-orange-50 hover:border-primary hover:text-primary"
                      }`}
                    >
                      {p}
                    </button>
                  ),
                )}

              <button
                onClick={() => updatePage(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="flex items-center gap-1 px-3 h-9 rounded-md border text-sm hover:bg-orange-50 hover:border-primary hover:text-primary transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Next <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense
      fallback={<div className="p-10 text-center">Loading search...</div>}
    >
      <SearchContent />
    </Suspense>
  );
}
