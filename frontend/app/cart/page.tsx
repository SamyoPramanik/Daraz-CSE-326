"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { fetchCart, updateCartItem, removeCartItem } from "@/lib/api";
import { useAuthStore } from "@/lib/authStore";

export default function CartPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [cartItems, setCartItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState<number | null>(null);

  // Initialize auth on mount
  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, []);

  // Check if user is admin - redirect if so
  useEffect(() => {
    if (hasInitialized && isLoggedIn && user?.is_admin) {
      router.push("/admin");
      return;
    }
  }, [hasInitialized, isLoggedIn, user?.is_admin, router]);

  // Fetch cart data on component mount
  useEffect(() => {
    const loadCart = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchCart();
        setCartItems(response.data || []);
      } catch (err: any) {
        if (err.message.includes("Unauthorized")) {
          setError("Please login to view your cart");
          // Optionally redirect to login
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(err.message || "Failed to load cart");
        }
        setCartItems([]);
      } finally {
        setLoading(false);
      }
    };

    loadCart();
  }, [router]);

  const updateQuantity = async (id: number, delta: number) => {
    const item = cartItems.find((i) => i.id === id);
    if (!item) return;

    const newQuantity = item.quantity + delta;

    // Prevent quantity from going below 1
    if (newQuantity < 1) return;

    // Prevent quantity from exceeding available stock
    if (newQuantity > item.stock) {
      setError(`Only ${item.stock} items available in stock`);
      return;
    }

    try {
      setUpdating(id);
      setError(null);
      await updateCartItem(id, newQuantity);

      // Update local state after successful API call
      // Use discount_price if available, otherwise use original price
      const effectivePrice = item.discount_price ?? item.price;

      setCartItems((items) =>
        items.map((i) => {
          if (i.id === id) {
            return {
              ...i,
              quantity: newQuantity,
              total_price: newQuantity * effectivePrice,
            };
          }
          return i;
        }),
      );
    } catch (err: any) {
      setError(err.message || "Failed to update quantity");
    } finally {
      setUpdating(null);
    }
  };

  const removeItem = async (id: number) => {
    try {
      setUpdating(id);
      await removeCartItem(id);

      // Remove from local state after successful API call
      setCartItems((items) => items.filter((item) => item.id !== id));
    } catch (err: any) {
      setError(err.message || "Failed to remove item from cart");
    } finally {
      setUpdating(null);
    }
  };

  const cartTotal = cartItems.reduce((acc, curr) => acc + curr.total_price, 0);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Loading your cart...
        </h2>
        <p className="text-gray-500">
          Please wait while we fetch your cart items.
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
        <p className="text-gray-500 mb-8">{error}</p>
        <Link href="/search">
          <Button className="bg-primary hover:bg-primary/90">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  if (cartItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">
          Your Cart is Empty
        </h2>
        <p className="text-gray-500 mb-8">
          Looks like you haven&apos;t added anything to your cart yet.
        </p>
        <Link href="/search">
          <Button className="bg-primary hover:bg-primary/90">
            Continue Shopping
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

      {error && (
        <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button
            onClick={() => setError(null)}
            className="text-red-600 hover:text-red-800 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Cart Items List */}
        <div className="flex-1 space-y-4">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative"
            >
              <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center shrink-0 relative">
                {item.image_url ? (
                  <Image
                    src={item.image_url}
                    alt={item.name}
                    fill
                    sizes="96px"
                    className="object-cover rounded"
                  />
                ) : (
                  <span className="text-xs text-gray-400">No Image</span>
                )}
              </div>
              <div className="flex-1 w-full text-center sm:text-left">
                <Link
                  href={`/product/${item.product_id}`}
                  className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                <div className="text-sm text-gray-500 mt-1">
                  Unit Price: ৳{" "}
                  {(item.discount_price ?? item.price).toLocaleString()}
                  {item.discount_price && (
                    <span className="ml-2 text-xs line-through text-gray-400">
                      ৳ {item.price.toLocaleString()}
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-400 mt-1">
                  Stock: {item.stock} available
                </div>
              </div>

              <div className="flex items-center gap-6 mt-4 sm:mt-0">
                <div className="flex items-center border rounded-md">
                  <button
                    onClick={() => updateQuantity(item.id, -1)}
                    disabled={item.quantity === 1 || updating === item.id}
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    -
                  </button>
                  <span className="px-4 py-1 font-medium min-w-12 text-center">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateQuantity(item.id, 1)}
                    disabled={
                      item.quantity >= item.stock || updating === item.id
                    }
                    className="px-3 py-1 bg-gray-50 hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
                  >
                    +
                  </button>
                </div>

                <div className="font-bold text-lg text-primary min-w-24 text-right">
                  ৳ {item.total_price.toLocaleString()}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => removeItem(item.id)}
                  className="text-gray-400 hover:text-red-500"
                >
                  <Trash2 className="w-5 h-5" />
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary Checkout Card */}
        <div className="w-full lg:w-96 shrink-0">
          <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
            <h2 className="text-xl font-bold text-gray-900 mb-6">
              Order Summary
            </h2>
            <div className="space-y-4 text-sm text-gray-600 mb-6 border-b pb-6">
              <div className="flex justify-between">
                <span>Subtotal ({cartItems.length} items)</span>
                <span>৳ {cartTotal.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>Calculated at checkout</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900 mb-6">
              <span>Total</span>
              <span className="text-primary">
                ৳ {cartTotal.toLocaleString()}
              </span>
            </div>

            <Button
              onClick={() => router.push("/checkout")}
              className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold h-12 text-lg"
            >
              Proceed to Checkout
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
