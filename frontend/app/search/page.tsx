"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import ProductCard from "@/components/ProductCard";
import { ChevronDown, SlidersHorizontal } from "lucide-react";

// Mock Categories
const CATEGORIES = ["Electronics", "Clothing", "Home & Kitchen", "Books", "Beauty", "Sports"];

function SearchContent() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // URL States
    const currentSearch = searchParams.get("search") || "";
    const currentSort = searchParams.get("sort") || "pop";
    const currentCategories = searchParams.get("category")?.split(",").filter(Boolean) || [];

    // Local State representing URL intent (for immediate typing response before push)
    const [searchInput, setSearchInput] = useState(currentSearch);

    // Sync back to URL
    const updateQuery = useCallback((key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams.toString());
        if (value) {
            params.set(key, value);
        } else {
            params.delete(key);
        }
        // reset page to 1 whenever filters change
        params.set("page", "1");
        router.push(`${pathname}?${params.toString()}`);
    }, [searchParams, pathname, router]);

    // Handle Category Toggle
    const toggleCategory = (cat: string) => {
        let newCats = [...currentCategories];
        if (newCats.includes(cat)) {
            newCats = newCats.filter(c => c !== cat);
        } else {
            newCats.push(cat);
        }
        updateQuery("category", newCats.length ? newCats.join(",") : null);
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

                        <div className="space-y-4">
                            <h3 className="font-medium text-gray-900">Categories</h3>
                            <div className="flex flex-col gap-3">
                                {CATEGORIES.map(cat => (
                                    <label key={cat} className="flex items-center gap-3 space-x-2 cursor-pointer">
                                        <Checkbox
                                            checked={currentCategories.includes(cat)}
                                            onCheckedChange={() => toggleCategory(cat)}
                                        />
                                        <span className="text-sm text-gray-700">{cat}</span>
                                    </label>
                                ))}
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
                            <span className="text-sm text-gray-500 whitespace-nowrap">Sort by:</span>
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
                    {(currentCategories.length > 0 || currentSearch) && (
                        <div className="mb-4 flex flex-wrap gap-2 text-sm">
                            <span className="text-gray-500 mt-1">Active Filters:</span>
                            {currentSearch && (
                                <span className="rounded-full bg-orange-100 px-3 py-1 text-primary">
                                    Search: "{currentSearch}"
                                </span>
                            )}
                            {currentCategories.map(cat => (
                                <span key={cat} className="rounded-full bg-orange-100 px-3 py-1 text-primary flex items-center gap-1">
                                    {cat}
                                    <button onClick={() => toggleCategory(cat)} className="ml-1 text-xl leading-none hover:text-red-500">&times;</button>
                                </span>
                            ))}
                        </div>
                    )}

                    {/* Product Grid */}
                    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
                        {/* Generating mock product cards until API is hooked up */}
                        {Array.from({ length: 12 }).map((_, i) => (
                            <ProductCard
                                key={i}
                                id={`prod_${i}`}
                                name={`DarazClone Super Product ${i + 1} with an extremely long title name to show clamping`}
                                price={Math.floor(Math.random() * 5000) + 100}
                                originalPrice={Math.floor(Math.random() * 2000) + 5100}
                                rating={3 + (Math.random() * 2)}
                            />
                        ))}
                    </div>
                </div>

            </div>
        </div>
    );
}

export default function SearchPage() {
    return (
        <Suspense fallback={<div className="p-10 text-center">Loading search...</div>}>
            <SearchContent />
        </Suspense>
    );
}
