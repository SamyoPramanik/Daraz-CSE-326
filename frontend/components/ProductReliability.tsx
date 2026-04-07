"use client";

import { useState, useEffect } from "react";
import { fetchProductReliabilityScore } from "@/lib/api";
import { Loader2, ShieldCheck } from "lucide-react";

interface ReliabilityData {
  reliability_score: number;
  ai_comment?: string | null;
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
            Loading reliability score...
          </p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null; // Silently fail if unavailable
  }

  const hasScore = data.reliability_score > 0;
  const scoreColor =
    data.reliability_score >= 8
      ? "text-green-600"
      : data.reliability_score >= 6
        ? "text-yellow-600"
        : "text-red-600";

  const scoreBackgroundColor =
    data.reliability_score >= 8
      ? "bg-green-50 border-green-200"
      : data.reliability_score >= 6
        ? "bg-yellow-50 border-yellow-200"
        : "bg-red-50 border-red-200";

  return (
    <div className={`rounded-lg p-6 border ${hasScore ? scoreBackgroundColor : 'bg-gray-50 border-gray-200'}`}>
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-primary" />
          Reliability Score
        </h3>

        <div>
          {hasScore ? (
            <div className="flex flex-col sm:flex-row items-center gap-6">
              <div className="text-center">
                <span className={`text-4xl font-extrabold ${scoreColor}`}>
                  {data.reliability_score}<span className="text-xl text-gray-500 font-medium">/10</span>
                </span>
              </div>
              {data.ai_comment && (
                <div className="flex-1 bg-white/60 p-4 rounded-lg border border-gray-200">
                  <p className="text-sm text-gray-700 italic font-medium">"{data.ai_comment}"</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-gray-600 italic bg-white/60 p-3 rounded-lg border border-gray-200">
              The product has not enough reviews yet to generate a reliability score.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
