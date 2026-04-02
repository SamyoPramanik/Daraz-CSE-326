"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";
import { fetchOrders } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";
import ReviewForm from "@/components/ReviewForm";

interface Product {
  id: string;
  product_id: string;
  product_name: string;
  image_url: string;
  price: number;
  rating: number | null;
  review: string | null;
  review_date: string | null;
}

export default function MyReviewsPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [reviewedProducts, setReviewedProducts] = useState<Product[]>([]);
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

  // Initialize auth on mount
  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, []);

  // Check if user is admin - redirect if so
  useEffect(() => {
    if (hasInitialized && isLoggedIn && user?.is_admin) {
      router.push("/admin");
      return;
    }
  }, [hasInitialized, isLoggedIn, user?.is_admin, router]);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrders();
        const orders = response.data || [];

        // Extract all products from orders
        const products: Product[] = [];
        orders.forEach((order: any) => {
          if (order.order_items && order.order_status === 'Delivered' && Array.isArray(order.order_items)) {
            order.order_items.forEach((item: any) => {
              products.push({
                id: item.id,
                product_id: item.product_id,
                product_name: item.product_name,
                image_url: item.image_url,
                price: item.price,
                rating: item.rating || null,
                review: item.review || null,
                review_date: item.review_date || null,
              });
            });
          }
        });

        setAllProducts(products);

        // Separate into reviewed and pending
        const reviewed = products.filter((p) => p.rating !== null);
        const pending = products.filter((p) => p.rating === null);

        setReviewedProducts(reviewed);
        setPendingProducts(pending);
      } catch (err: any) {
        if (err.message.includes("Unauthorized")) {
          setError("Please login to view your reviews");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(err.message || "Failed to load reviews");
        }
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [router, refreshKey]);

  const handleReviewSubmitted = () => {
    // Refresh the data
    setRefreshKey((prev) => prev + 1);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          My Reviews
        </h1>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading your reviews...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          My Reviews
        </h1>
        <div className="text-center py-10">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/search">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-2 border-b pb-4">
        My Reviews
      </h1>

      {allProducts.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You haven't ordered any products yet.
          </p>
          <Link href="/search">
            <Button className="bg-primary hover:bg-primary/90">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Already Reviewed Section */}
          {reviewedProducts.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Already Reviewed
                </h2>
                <p className="text-sm text-gray-500">
                  {reviewedProducts.length} product
                  {reviewedProducts.length !== 1 ? "s" : ""} reviewed
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {reviewedProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 bg-gray-50 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0 relative">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.product_name}
                            fill
                            sizes="80px"
                            className="object-cover rounded"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            No Image
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/product/${product.product_id}`}
                          className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.product_name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          ৳ {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Review Details */}
                    <div className="border-t pt-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="flex items-center text-yellow-400">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                              key={star}
                              className={`w-4 h-4 ${star <= (product.rating || 0)
                                  ? "fill-yellow-400"
                                  : "text-gray-300"
                                }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium text-gray-900">
                          {product.rating}/5
                        </span>
                      </div>

                      {product.review && (
                        <p className="text-sm text-gray-700 line-clamp-3">
                          {product.review}
                        </p>
                      )}

                      <p className="text-xs text-gray-500 mt-2">
                        {product.review_date
                          ? `Reviewed on ${new Date(product.review_date).toLocaleDateString()}`
                          : "Review date not available"}
                      </p>

                      <Link href={`/product/${product.product_id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                        >
                          View Review
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ready to Review Section */}
          {pendingProducts.length > 0 && (
            <div>
              <div className="mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Ready to Review
                </h2>
                <p className="text-sm text-gray-500">
                  {pendingProducts.length} product
                  {pendingProducts.length !== 1 ? "s" : ""} waiting for your
                  review
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {pendingProducts.map((product) => (
                  <div
                    key={product.id}
                    className="border rounded-lg p-4 hover:border-primary/50 transition-colors"
                  >
                    <div className="flex gap-4 mb-4">
                      <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0 relative">
                        {product.image_url ? (
                          <Image
                            src={product.image_url}
                            alt={product.product_name}
                            fill
                            sizes="80px"
                            className="object-cover rounded"
                          />
                        ) : (
                          <span className="text-xs text-gray-400">
                            No Image
                          </span>
                        )}
                      </div>
                      <div className="flex-1">
                        <Link
                          href={`/product/${product.product_id}`}
                          className="font-medium text-gray-900 hover:text-primary transition-colors line-clamp-2"
                        >
                          {product.product_name}
                        </Link>
                        <p className="text-sm text-gray-500 mt-1">
                          ৳ {product.price.toLocaleString()}
                        </p>
                      </div>
                    </div>
                    <ReviewForm
                      productId={product.product_id}
                      productName={product.product_name}
                      onReviewSubmitted={handleReviewSubmitted}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Empty State */}
          {pendingProducts.length === 0 && reviewedProducts.length === 0 && (
            <div className="text-center py-10">
              <p className="text-gray-500">No products to review yet.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
