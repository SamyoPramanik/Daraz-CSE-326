"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Star } from "lucide-react";

export default function MyReviewsPage() {
    // Mock API payload for ordered items
    const [reviewItems, setReviewItems] = useState([
        {
            order_item_id: 1,
            product_id: "uuid-1",
            name: "Samsung Galaxy S24 Ultra 5G",
            image_url: "",
            purchased_at: "2026-03-15T10:00:00Z",
            review_submitted: true, // Already reviewed
            user_rating: 5,
            user_review_text: "Absolutely phenomenal camera capabilities.",
        },
        {
            order_item_id: 2,
            product_id: "uuid-2",
            name: "Apple 20W USB-C Power Adapter",
            image_url: "",
            purchased_at: "2026-03-18T09:30:00Z",
            review_submitted: false, // Needs review
            user_rating: 0,
            user_review_text: "",
        }
    ]);

    // Handle local form states for the ones needing reviews
    const [activeRatings, setActiveRatings] = useState<Record<number, number>>({});
    const [activeTexts, setActiveTexts] = useState<Record<number, string>>({});

    const handleRatingSelect = (itemId: number, rating: number) => {
        setActiveRatings(prev => ({ ...prev, [itemId]: rating }));
    };

    const handleTextChange = (itemId: number, text: string) => {
        setActiveTexts(prev => ({ ...prev, [itemId]: text }));
    };

    const submitReview = (itemId: number) => {
        const r = activeRatings[itemId];
        const t = activeTexts[itemId];
        if (!r) return alert("Please select a star rating first.");

        // TODO: Fire API `POST /api/reviews`
        console.log(`Submitting Review for item ${itemId}: ${r} stars. Text: ${t}`);

        // Optimistic Update
        setReviewItems(items => items.map(item =>
            item.order_item_id === itemId
                ? { ...item, review_submitted: true, user_rating: r, user_review_text: t || "" }
                : item
        ));
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">My Reviews</h1>

            <div className="space-y-8">
                {reviewItems.length === 0 ? (
                    <p className="text-gray-500 text-center py-10">You have no items eligible for review.</p>
                ) : (
                    reviewItems.map(item => (
                        <div key={item.order_item_id} className="border rounded-lg p-5 flex flex-col sm:flex-row gap-6">

                            {/* Product Info */}
                            <div className="flex gap-4 sm:w-1/3 shrink-0 border-b sm:border-b-0 sm:border-r pb-4 sm:pb-0 sm:pr-4">
                                <div className="w-20 h-20 bg-gray-100 flex items-center justify-center shrink-0">
                                    <span className="text-xs text-gray-400">Image</span>
                                </div>
                                <div>
                                    <Link href={`/product/${item.product_id}`} className="font-semibold text-gray-900 hover:text-primary leading-tight">
                                        {item.name}
                                    </Link>
                                    <div className="text-xs text-gray-400 mt-2">Delivered: {new Date(item.purchased_at).toLocaleDateString()}</div>
                                </div>
                            </div>

                            {/* Review Section */}
                            <div className="flex-1">
                                {item.review_submitted ? (
                                    <div className="bg-gray-50 rounded-lg p-4 h-full border border-gray-100">
                                        <div className="flex items-center gap-2 mb-2">
                                            <span className="text-sm font-semibold text-gray-700">Your Rating:</span>
                                            <div className="flex text-yellow-500">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                    <Star key={i} className={`w-4 h-4 ${i < item.user_rating ? "fill-current" : "text-gray-300"}`} />
                                                ))}
                                            </div>
                                        </div>
                                        {item.user_review_text && (
                                            <p className="text-sm text-gray-600 italic">"{item.user_review_text}"</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        <div>
                                            <span className="block text-sm font-semibold text-gray-900 mb-2">Rate this product</span>
                                            <div className="flex gap-1 text-yellow-500">
                                                {Array.from({ length: 5 }).map((_, i) => {
                                                    const ratingValue = i + 1;
                                                    const currentRating = activeRatings[item.order_item_id] || 0;
                                                    return (
                                                        <Star
                                                            key={i}
                                                            className={`w-8 h-8 cursor-pointer transition-colors ${ratingValue <= currentRating ? "fill-current" : "text-gray-200 hover:text-yellow-300"}`}
                                                            onClick={() => handleRatingSelect(item.order_item_id, ratingValue)}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                        <div>
                                            <span className="block text-sm font-semibold text-gray-900 mb-2">Detailed Review</span>
                                            <textarea
                                                className="w-full border rounded-md p-3 text-sm focus:ring-1 focus:ring-primary focus:outline-none min-h-24 resize-y"
                                                placeholder="What did you like or dislike about this product?"
                                                value={activeTexts[item.order_item_id] || ""}
                                                onChange={(e) => handleTextChange(item.order_item_id, e.target.value)}
                                            />
                                        </div>
                                        <Button
                                            onClick={() => submitReview(item.order_item_id)}
                                            className="bg-primary hover:bg-primary/90 text-white font-bold px-8 shadow-sm"
                                        >
                                            Submit Review
                                        </Button>
                                    </div>
                                )}
                            </div>

                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
