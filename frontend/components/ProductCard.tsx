"use client";

import Image from "next/image";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";

interface ProductCardProps {
    id: string;
    name: string;
    price: number;
    rating: number;
    imageUrl?: string;
    originalPrice?: number;
}

export default function ProductCard({ id, name, price, rating, imageUrl, originalPrice }: ProductCardProps) {
    const handleAddToCart = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // API Call goes here to increment cart quantity
        toast.success("Product added to cart");
    };

    return (
        <Link href={`/product/${id}`}>
            <Card className="group h-full cursor-pointer flex flex-col overflow-hidden border-gray-100 bg-white transition-all hover:shadow-md">
                <div className="aspect-square bg-gray-100 w-full relative">
                    {imageUrl ? (
                        <Image
                            src={imageUrl}
                            alt={name}
                            fill
                            sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
                            className="object-cover"
                        />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                            No Image
                        </div>
                    )}
                </div>
                <CardContent className="px-4 py-2 flex flex-1 flex-col justify-between">
                    <div>
                        <h3 className="line-clamp-2 text-lg font-semibold text-gray-900 mb-1" title={name}>
                            {name}
                        </h3>
                        <div className="mt-auto flex items-center justify-between">
                            <div className="flex items-baseline gap-2">
                                <span className="text-lg font-bold text-primary">৳{price}</span>
                                {originalPrice && originalPrice > price && (
                                    <span className="text-xs text-gray-500 line-through">৳{originalPrice}</span>
                                )}
                            </div>
                            <div className="flex items-center gap-1 text-yellow-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="text-xs font-medium text-gray-700">{rating.toFixed(1)}</span>
                            </div>
                        </div>
                    </div>
                    <div className="mt-3 pt-2 border-t">
                        <Button
                            variant="default"
                            className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
                            onClick={handleAddToCart}
                        >
                            <ShoppingCart className="w-4 h-4" />
                            Add to Cart
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </Link>
    );
}
