"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { fetchCart, updateCartItem, removeCartItem } from "@/lib/api";

export default function CartPage() {
    const router = useRouter();

    const [cartItems, setCartItems] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState<number | null>(null);

    // Fetch cart data on component mount
    useEffect(() => {
        const loadCart = async () => {
            try {
                setLoading(true);
                setError(null);
                const response = await fetchCart();
                setCartItems(response.data || []);
            } catch (err: any) {
                if (err.message.includes('Unauthorized')) {
                    setError('Please login to view your cart');
                    // Optionally redirect to login
                    setTimeout(() => router.push('/login'), 2000);
                } else {
                    setError(err.message || 'Failed to load cart');
                }
                setCartItems([]);
            } finally {
                setLoading(false);
            }
        };

        loadCart();
    }, [router]);

    const updateQuantity = async (id: number, delta: number) => {
        const item = cartItems.find(i => i.id === id);
        if (!item) return;

        const newQuantity = Math.max(1, item.quantity + delta);
        
        try {
            setUpdating(id);
            await updateCartItem(id, newQuantity);
            
            // Update local state after successful API call
            setCartItems(items => items.map(i => {
                if (i.id === id) {
                    return {
                        ...i,
                        quantity: newQuantity,
                        total_price: newQuantity * i.price
                    };
                }
                return i;
            }));
        } catch (err: any) {
            setError(err.message || 'Failed to update quantity');
        } finally {
            setUpdating(null);
        }
    };

    const removeItem = async (id: number) => {
        try {
            setUpdating(id);
            await removeCartItem(id);
            
            // Remove from local state after successful API call
            setCartItems(items => items.filter(item => item.id !== id));
        } catch (err: any) {
            setError(err.message || 'Failed to remove item from cart');
        } finally {
            setUpdating(null);
        }
    };

    const cartTotal = cartItems.reduce((acc, curr) => acc + curr.total_price, 0);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Loading your cart...</h2>
                <p className="text-gray-500">Please wait while we fetch your cart items.</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4 text-red-600">Error</h2>
                <p className="text-gray-500 mb-8">{error}</p>
                <Link href="/search">
                    <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    if (cartItems.length === 0) {
        return (
            <div className="container mx-auto px-4 py-16 text-center">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">Your Cart is Empty</h2>
                <p className="text-gray-500 mb-8">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Link href="/search">
                    <Button className="bg-primary hover:bg-primary/90">Continue Shopping</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>

            <div className="flex flex-col lg:flex-row gap-8">
                {/* Cart Items List */}
                <div className="flex-1 space-y-4">
                    {cartItems.map((item) => (
                        <div key={item.id} className="flex flex-col sm:flex-row items-center gap-4 bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative">
                            <div className="w-24 h-24 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                <span className="text-xs text-gray-400">Image</span>
                            </div>
                            <div className="flex-1 w-full text-center sm:text-left">
                                <Link href={`/product/${item.product_id}`} className="font-semibold text-lg text-gray-900 hover:text-primary transition-colors">
                                    {item.name}
                                </Link>
                                <div className="text-sm text-gray-500 mt-1">Unit Price: ৳ {item.price.toLocaleString()}</div>
                            </div>

                            <div className="flex items-center gap-6 mt-4 sm:mt-0">
                                <div className="flex items-center border rounded-md">
                                    <button
                                        onClick={() => updateQuantity(item.id, -1)}
                                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg"
                                    >-</button>
                                    <span className="px-4 py-1 font-medium min-w-12 text-center">{item.quantity}</span>
                                    <button
                                        onClick={() => updateQuantity(item.id, 1)}
                                        className="px-3 py-1 bg-gray-50 hover:bg-gray-100 text-lg"
                                    >+</button>
                                </div>

                                <div className="font-bold text-lg text-primary min-w-24 text-right">
                                    ৳ {item.total_price.toLocaleString()}
                                </div>

                                <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)} className="text-gray-400 hover:text-red-500">
                                    <Trash2 className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Order Summary Checkout Card */}
                <div className="w-full lg:w-96 shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
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
                            <span className="text-primary">৳ {cartTotal.toLocaleString()}</span>
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
