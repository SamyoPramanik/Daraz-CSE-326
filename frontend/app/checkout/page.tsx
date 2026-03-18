"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function CheckoutPage() {
    const router = useRouter();
    const [shippingAddress, setShippingAddress] = useState("");
    const [paymentMethod, setPaymentMethod] = useState("Cash on Delivery");

    // Mock static total from cart pipeline
    const cartTotal = 94999.0;

    const handlePlaceOrder = (e: React.FormEvent) => {
        e.preventDefault();
        if (!shippingAddress) return alert("Please enter a shipping address.");

        // API `POST /api/orders/checkout` triggering logic goes here
        console.log("Placing order", { shippingAddress, paymentMethod });
        alert("Order Placed Successfully!");

        // Hard navigate to Orders page after clearing out
        router.push("/profile/orders");
    };

    return (
        <div className="container mx-auto px-4 py-8 max-w-5xl">
            <h1 className="text-3xl font-bold text-gray-900 mb-8">Checkout</h1>

            <form onSubmit={handlePlaceOrder} className="flex flex-col lg:flex-row gap-8">

                {/* Left Forms */}
                <div className="flex-1 space-y-8">

                    <Card className="shadow-sm border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-xl">Shipping Address</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium leading-none" htmlFor="address">Full Address</label>
                                    <Input
                                        id="address"
                                        placeholder="123 Main St, Dhaka, Bangladesh"
                                        value={shippingAddress}
                                        onChange={(e) => setShippingAddress(e.target.value)}
                                        required
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className="shadow-sm border-gray-100">
                        <CardHeader>
                            <CardTitle className="text-xl">Payment Method</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {["Cash on Delivery", "bKash", "Credit/Debit Card"].map(method => (
                                    <label key={method} className="flex items-center gap-3 p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                                        <Checkbox
                                            checked={paymentMethod === method}
                                            onCheckedChange={() => setPaymentMethod(method)}
                                            className="rounded-full rounded-full"
                                        />
                                        <span className="font-medium text-gray-700">{method}</span>
                                    </label>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                </div>

                {/* Right Summary */}
                <div className="w-full lg:w-96 shrink-0">
                    <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm sticky top-24">
                        <h2 className="text-xl font-bold text-gray-900 mb-6">Order Summary</h2>
                        <div className="space-y-4 text-sm text-gray-600 mb-6 border-b pb-6">
                            <div className="flex justify-between">
                                <span>Items Total</span>
                                <span>৳ {cartTotal.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Delivery Fee</span>
                                <span>৳ 60.00</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-xl text-gray-900 mb-8">
                            <span>Total Payment</span>
                            <span className="text-primary">৳ {(cartTotal + 60).toLocaleString()}</span>
                        </div>

                        <Button
                            type="submit"
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold h-14 text-lg"
                        >
                            Place Order
                        </Button>
                        <p className="text-xs text-center text-gray-400 mt-4">
                            By clicking "Place Order" you agree to our Terms & Conditions.
                        </p>
                    </div>
                </div>

            </form>
        </div>
    );
}
