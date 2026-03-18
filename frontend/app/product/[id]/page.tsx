"use client";

import { useState, use } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, Truck, ShieldCheck, Divide } from "lucide-react";
import { toast } from "sonner";

export default function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const router = useRouter();
    const [quantity, setQuantity] = useState(1);
    const [activeTab, setActiveTab] = useState("description");

    // Placeholder static data based on API_GUIDE.md structure
    const product = {
        id: resolvedParams.id,
        name: "Samsung Galaxy S24 Ultra 5G",
        description: "The ultimate flagship experience. Featuring a 200MP camera, titanium frame, and Snapdragon 8 Gen 3 processed tuned for Galaxy.",
        price: 139999.0,
        discount_price: 129999.0,
        stock: 50,
        rating: {
            avg: 4.8,
            total_reviews: 125,
        },
        reviews: [
            { id: 1, user_name: "Ahmed", rating: 5, review: "Great phone!", created_at: "2026-03-18" },
            { id: 2, user_name: "Sarah", rating: 4, review: "Battery life is excellent.", created_at: "2026-03-15" }
        ]
    };

    const handleAddToCart = () => {
        // API logic to `POST /cart` will go here
        console.log(`Added ${quantity} of ${product.id} to cart`);
        toast.success("Product added to cart");
    };

    const handleBuyNow = () => {
        console.log(`Buy now: ${quantity} of ${product.id}`);
        router.push("/checkout"); // bypass cart UI for direct purchase
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Product Image Viewer */}
                    <div className="md:w-5/12 lg:w-1/2">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            <span className="text-gray-400 font-medium">Product Image Large</span>
                        </div>
                        <div className="flex gap-2 mt-4 overflow-x-auto pb-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="w-20 h-20 bg-gray-100 border-2 rounded shrink-0 cursor-pointer hover:border-primary transition-colors flex items-center justify-center text-xs text-gray-400">
                                    Thumb {i}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Product Info Setup */}
                    <div className="md:w-7/12 lg:w-1/2 flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="ml-1 font-bold text-gray-900">{product.rating.avg}</span>
                                <span className="ml-1 text-sm text-primary hover:underline cursor-pointer">
                                    ({product.rating.total_reviews} Reviews)
                                </span>
                            </div>
                        </div>

                        <div className="border-y py-4 mb-6 bg-gray-50/50 -mx-6 px-6 md:mx-0 md:px-4 md:rounded-lg">
                            <div className="flex items-end gap-3 mb-1">
                                <span className="text-3xl font-bold text-primary">৳ {product.discount_price.toLocaleString()}</span>
                                {product.price > product.discount_price && (
                                    <span className="text-lg text-gray-400 line-through mb-1">৳ {product.price.toLocaleString()}</span>
                                )}
                            </div>
                        </div>

                        <div className="space-y-4 mb-8 flex-grow">
                            <p className="text-gray-600 line-clamp-3 leading-relaxed">
                                {product.description}
                            </p>

                            {/* Fake Daraz Features */}
                            <div className="grid grid-cols-2 gap-3 text-sm pt-4">
                                <div className="flex items-center gap-2 text-gray-700">
                                    <Truck className="w-5 h-5 text-gray-400" />
                                    <span>Standard Delivery (3-5 days)</span>
                                </div>
                                <div className="flex items-center gap-2 text-gray-700">
                                    <ShieldCheck className="w-5 h-5 text-gray-400" />
                                    <span>100% Authentic Guarantee</span>
                                </div>
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-col gap-4 mt-auto">
                            <div className="flex items-center gap-4">
                                <span className="text-gray-700 font-medium">Quantity</span>
                                <div className="flex items-center border rounded-md">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg rounded-l-md"
                                    >-</button>
                                    <span className="px-4 py-1 font-medium min-w-12 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}
                                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg rounded-r-md"
                                    >+</button>
                                </div>
                                <span className="text-sm text-gray-500">Only {product.stock} items left</span>
                            </div>

                            <div className="flex gap-4 mt-4">
                                <Button
                                    onClick={handleBuyNow}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white h-12 text-lg font-semibold"
                                >
                                    Buy Now
                                </Button>
                                <Button
                                    onClick={handleAddToCart}
                                    className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-lg font-semibold"
                                >
                                    Add to Cart
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs Section */}
            <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="flex border-b">
                    <button
                        onClick={() => setActiveTab("description")}
                        className={`flex-1 py-4 font-medium text-center transition-colors ${activeTab === "description" ? "text-primary border-b-2 border-primary bg-orange-50/50" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        Description
                    </button>
                    <button
                        onClick={() => setActiveTab("reviews")}
                        className={`flex-1 py-4 font-medium text-center transition-colors ${activeTab === "reviews" ? "text-primary border-b-2 border-primary bg-orange-50/50" : "text-gray-600 hover:bg-gray-50"}`}
                    >
                        Reviews ({product.rating.total_reviews})
                    </button>
                </div>
                <div className="p-6 md:p-8">
                    {activeTab === "description" ? (
                        <div className="prose max-w-none text-gray-700">
                            <h3 className="text-xl font-bold mb-4">Product Details</h3>
                            <p>{product.description}</p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <h3 className="text-xl font-bold mb-4">Customer Reviews</h3>
                            {product.reviews.map(review => (
                                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-500">
                                            {review.user_name.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{review.user_name}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex text-yellow-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star key={i} className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-300"}`} />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">{review.created_at}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <p className="text-gray-700 text-sm pl-10">{review.review}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
