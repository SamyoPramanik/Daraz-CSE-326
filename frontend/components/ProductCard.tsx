"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Star, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/api";

interface ProductCardProps {
  id: string;
  name: string;
  price: number;
  rating: number;
  imageUrl?: string;
  originalPrice?: number;
  stock?: number;
}

export default function ProductCard({
  id,
  name,
  price,
  rating,
  imageUrl,
  originalPrice,
  stock = 99,
}: ProductCardProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleAddToCart = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setIsLoading(true);
      console.log("[ProductCard] Adding to cart:", { id, quantity: 1 });
      await addToCart(id, 1);
      console.log("[ProductCard] Successfully added to cart");
      toast.success("Product added to cart!");
    } catch (err: any) {
      console.error("[ProductCard] Error adding to cart:", err);
      if (err.message.includes("Unauthorized")) {
        toast.error("Please login to add items to cart");
        router.push("/login");
      } else {
        toast.error(err.message || "Failed to add to cart");
      }
    } finally {
      setIsLoading(false);
    }
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
            <h3
              className="line-clamp-2 text-lg font-semibold text-gray-900 mb-1"
              title={name}
            >
              {name}
            </h3>
            <div className="mt-auto flex items-center justify-between">
              <div className="flex items-baseline gap-2">
                <span className="text-lg font-bold text-primary">
                  ৳{price.toLocaleString()}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xs text-gray-500 line-through">
                    ৳{originalPrice.toLocaleString()}
                  </span>
                )}
              </div>
              <div className="flex items-center gap-1 text-yellow-500">
                <Star className="h-4 w-4 fill-current" />
                <span className="text-xs font-medium text-gray-700">
                  {rating.toFixed(1)}
                </span>
              </div>
            </div>
          </div>
          <div className="mt-3 pt-2 border-t">
            {stock === 0 ? (
              <Button
                disabled
                className="w-full bg-gray-400 text-white cursor-not-allowed"
              >
                Out of Stock
              </Button>
            ) : (
              <Button
                variant="default"
                className="w-full bg-primary hover:bg-primary/90 text-white gap-2"
                onClick={handleAddToCart}
                disabled={isLoading}
              >
                <ShoppingCart className="w-4 h-4" />
                {isLoading ? "Adding..." : "Add to Cart"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
