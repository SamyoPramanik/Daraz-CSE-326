"use client";

import { useEffect, useState } from "react";
import { fetchProductReviews } from "@/lib/api";
import ReviewsList from "./ReviewsList";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  review?: string | null;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export default function ProductReviews({ productId }: ProductReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        const response = await fetchProductReviews(productId);
        const reviewsArray = response?.data?.reviews || [];
        setReviews(reviewsArray);
        setError(null);
      } catch (err) {
        console.error("Failed to load reviews:", err);
        setError("Failed to load reviews");
        setReviews([]);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [productId]);

  if (loading) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <div className="animate-pulse">
            <div className="h-6 bg-gray-200 rounded w-1/4 mb-4"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-20 bg-gray-100 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      </div>
    );
  }

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-6 md:p-8">
          <h2 className="text-xl font-bold mb-4">Customer Reviews</h2>
          <p className="text-gray-500 text-center py-8">
            No reviews yet. Be the first to review this product!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="p-6 md:p-8">
        <h2 className="text-xl font-bold mb-6">
          Customer Reviews
          <span className="ml-2 text-sm font-normal text-gray-500">
            ({reviews.length})
          </span>
        </h2>
        <ReviewsList reviews={reviews} />
      </div>
    </div>
  );
}
