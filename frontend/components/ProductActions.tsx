"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ProductActionsProps {
    productId: string;
    stock: number;
}

export default function ProductActions({ productId, stock }: ProductActionsProps) {
    const [quantity, setQuantity] = useState(1);

    const handleAddToCart = () => {
        // POST /api/cart logic goes here
        toast.success(`Product added to cart (${productId})`);
    };

    return (
        <div className="flex flex-col gap-4 mt-auto">
            <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">Quantity</span>
                <div className="flex items-center border rounded-md overflow-hidden">
                    <button
                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-lg font-medium transition-colors"
                    >
                        −
                    </button>
                    <span className="px-5 py-2 font-semibold min-w-14 text-center">{quantity}</span>
                    <button
                        onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                        className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-lg font-medium transition-colors"
                    >
                        +
                    </button>
                </div>
                {stock < 10 && (
                    <span className="text-sm text-red-500 font-medium">Only {stock} left!</span>
                )}
            </div>

            <div className="flex gap-3 mt-2">
                <Button
                    onClick={handleAddToCart}
                    className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold gap-2"
                >
                    <ShoppingCart className="w-4 h-4" />
                    Add to Cart
                </Button>
            </div>
        </div>
    );
}
