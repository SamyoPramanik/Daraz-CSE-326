"use client";

import { Star } from "lucide-react";

interface Review {
  id: number;
  user_name: string;
  rating: number;
  review?: string | null;
  created_at: string;
}

interface ReviewsListProps {
  reviews: Review[];
  avgRating?: number;
  totalReviews?: number;
}

export default function ReviewsList({
  reviews,
  avgRating,
  totalReviews,
}: ReviewsListProps) {
  // Calculate average rating and total reviews if not provided
  const calculatedAvgRating =
    avgRating ??
    (reviews.length > 0
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0);

  const calculatedTotalReviews = totalReviews ?? reviews.length;
  if (!reviews || reviews.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">No reviews yet. Be the first to review!</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Rating Summary */}
      <div className="bg-gray-50 rounded-lg p-6">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-4xl font-bold text-gray-900">
              {calculatedAvgRating.toFixed(1)}
            </div>
            <div className="flex items-center justify-center gap-1 mt-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <Star
                  key={star}
                  className={`w-5 h-5 ${
                    star <= Math.round(calculatedAvgRating)
                      ? "fill-yellow-400 text-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-2">
              {calculatedTotalReviews} reviews
            </div>
          </div>
        </div>
      </div>

      {/* Individual Reviews */}
      <div className="space-y-4">
        {reviews.map((review) => (
          <div key={review.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="font-semibold text-gray-900">
                  {review.user_name}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex items-center">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= review.rating
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-sm text-gray-500">
                    {new Date(review.created_at).toLocaleDateString()}
                  </span>
                </div>
              </div>
            </div>

            {review.review && (
              <p className="text-gray-700 leading-relaxed">{review.review}</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
