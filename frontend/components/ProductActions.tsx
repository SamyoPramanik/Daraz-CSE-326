"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { addToCart } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

interface ProductActionsProps {
  productId: string;
  stock: number;
}

export default function ProductActions({
  productId,
  stock,
}: ProductActionsProps) {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();
  const [quantity, setQuantity] = useState(1);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize auth on mount
  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, [hasInitialized, initializeFromStorage]);

  const handleAddToCart = async () => {
    // Check if user is logged in
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!token) {
      toast.error("Please login to add items to cart");
      router.push("/login");
      return;
    }

    try {
      setIsLoading(true);
      await addToCart(productId, quantity);
      toast.success(`Added ${quantity} item(s) to cart!`);
      // Optionally redirect to cart
      // router.push('/cart');
    } catch (err: any) {
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

  // Don't show add to cart for admins
  if (user?.is_admin) {
    return (
      <div className="flex flex-col gap-4 mt-auto">
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
          <p className="text-gray-600 font-semibold">Admin View Only</p>
          <p className="text-gray-500 text-sm mt-1">
            Purchase functionality is not available for admin accounts
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4 mt-auto">
      {stock === 0 ? (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-700 font-semibold text-lg">Out of Stock</p>
          <p className="text-red-600 text-sm mt-1">
            This product is currently unavailable
          </p>
        </div>
      ) : (
        <>
          <div className="flex items-center gap-4">
            <span className="text-gray-700 font-medium">Quantity</span>
            <div className="flex items-center border rounded-md overflow-hidden">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-lg font-medium transition-colors"
              >
                −
              </button>
              <span className="px-5 py-2 font-semibold min-w-14 text-center">
                {quantity}
              </span>
              <button
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-3 py-2 bg-gray-50 hover:bg-gray-100 text-lg font-medium transition-colors"
              >
                +
              </button>
            </div>
            {stock < 10 && (
              <span className="text-sm text-red-500 font-medium">
                Only {stock} left!
              </span>
            )}
          </div>

          <div className="flex gap-3 mt-2">
            <Button
              onClick={handleAddToCart}
              disabled={isLoading}
              className="flex-1 bg-primary hover:bg-primary/90 text-white h-12 text-base font-semibold gap-2"
            >
              <ShoppingCart className="w-4 h-4" />
              {isLoading ? "Adding..." : "Add to Cart"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
