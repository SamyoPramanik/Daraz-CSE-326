"use client";

import { useState, useEffect } from "react";
import { fetchProductReliabilityScore } from "@/lib/api";
import { Loader2 } from "lucide-react";

interface ReliabilityData {
  reliability_score: number;
  confidence: string;
  reasoning: string;
  strengths: string;
  concerns: string;
  recommendation: string;
  metadata: {
    total_reviews: number;
    average_rating: number;
    reviews_with_text: number;
    generated_at: string;
  };
}

interface ProductReliabilityProps {
  productId: string;
}

export default function ProductReliability({
  productId,
}: ProductReliabilityProps) {
  const [data, setData] = useState<ReliabilityData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadReliabilityScore = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchProductReliabilityScore(productId);
        if (response.data) {
          setData(response.data);
        }
      } catch (err: any) {
        console.error("Failed to load reliability score:", err);
        setError(err.message || "Failed to load reliability score");
      } finally {
        setLoading(false);
      }
    };

    loadReliabilityScore();
  }, [productId]);

  if (loading) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6 border border-blue-100">
        <div className="flex items-center gap-3">
          <Loader2 className="w-5 h-5 animate-spin text-blue-600" />
          <p className="text-blue-700 font-medium">
            Analyzing customer reviews...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail if AI analysis is unavailable
  }

  const scoreColor =
    data.reliability_score >= 80
      ? "text-green-600"
      : data.reliability_score >= 60
        ? "text-yellow-600"
        : "text-red-600";

  const scoreBackgroundColor =
    data.reliability_score >= 80
      ? "bg-green-50 border-green-200"
      : data.reliability_score >= 60
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  const confidenceColor =
    data.confidence === "high"
      ? "text-green-600 bg-green-100"
      : data.confidence === "medium"
        ? "text-yellow-600 bg-yellow-100"
        : "text-gray-600 bg-gray-100";

  return (
    <div className={`rounded-lg p-6 border ${scoreBackgroundColor}`}>
      {/* Header with Score */}
      <div className="mb-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <span className="text-2xl">🤖</span>
          AI Reliability Analysis
        </h3>

        <div className="flex items-end gap-4">
          {data.metadata.total_reviews >= 5 ? (
            <div>
              <span className={`text-5xl font-bold ${scoreColor}`}>
                {data.reliability_score}%
              </span>
              <p className="text-sm text-gray-600 mt-1">Reliability Score</p>
            </div>
          ) : (
            <div className="flex bg-white/60 p-3 rounded-lg border border-gray-200">
              <p className="text-sm text-gray-600 italic">
                Need at least 5 reviews to calculate reliability score.
              </p>
            </div>
          )}
        </div>
      </div>



      {/* Review Stats */}
      <div className="grid grid-cols-3 gap-3 pt-4 border-t border-gray-200/50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.metadata.total_reviews}
          </p>
          <p className="text-xs text-gray-600">Total Reviews</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.metadata.average_rating.toFixed(1)}
          </p>
          <p className="text-xs text-gray-600">Avg Rating</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-900">
            {data.metadata.reviews_with_text}
          </p>
          <p className="text-xs text-gray-600">Detailed Reviews</p>
        </div>
      </div>
    </div>
  );
}
