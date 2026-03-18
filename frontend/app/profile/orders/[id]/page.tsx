import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = React.use(params);
    // Mock API payload representation
    const order = {
        id: resolvedParams.id,
        total_amount: 139999.0,
        shipping_total: 60.0,
        order_status: "Delivered",
        payment_method: "bKash",
        shipping_address: "123 Main St, Dhaka, Bangladesh",
        created_at: "2026-03-15T10:00:00Z",
        items: [
            {
                order_item_id: 1,
                product_id: "uuid-s24",
                name: "Samsung Galaxy S24 Ultra 5G",
                quantity: 1,
                price: 139939.0,
            }
        ]
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">

            {/* Header */}
            <div className="flex items-center gap-4 mb-8">
                <Link href="/profile/orders">
                    <Button variant="ghost" size="icon" className="rounded-full hover:bg-gray-100">
                        <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </Button>
                </Link>
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
                    <p className="text-sm text-gray-500">Order #{order.id}</p>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8">

                {/* Main Items Box */}
                <div className="flex-1 space-y-6">
                    <div className="border rounded-lg overflow-hidden">
                        <div className="bg-gray-50 p-4 border-b">
                            <h2 className="font-semibold text-gray-900">Items Ordered</h2>
                        </div>
                        <div className="p-4 space-y-4">
                            {order.items.map(item => (
                                <div key={item.order_item_id} className="flex gap-4">
                                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0">
                                        <span className="text-xs text-gray-400">Image</span>
                                    </div>
                                    <div className="flex-1">
                                        <Link href={`/product/${item.product_id}`} className="font-medium text-gray-900 hover:text-primary transition-colors">
                                            {item.name}
                                        </Link>
                                        <div className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</div>
                                    </div>
                                    <div className="text-right font-bold text-gray-900">
                                        ৳ {item.price.toLocaleString()}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="border rounded-lg p-5">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Shipping Address</h3>
                            <p className="text-gray-700 text-sm">{order.shipping_address}</p>
                        </div>
                        <div className="border rounded-lg p-5">
                            <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">Payment Method</h3>
                            <p className="text-gray-700 text-sm">{order.payment_method}</p>
                            <p className="text-green-600 font-medium text-sm mt-2">Payment Completed</p>
                        </div>
                    </div>
                </div>

                {/* Status and Financials */}
                <div className="w-full lg:w-80 shrink-0 space-y-6">
                    <div className="border rounded-lg p-5 bg-gray-50">
                        <h3 className="font-bold text-gray-900 mb-4">Order Summary</h3>
                        <div className="space-y-3 text-sm text-gray-600 mb-4 border-b pb-4 border-gray-200">
                            <div className="flex justify-between">
                                <span>Items Total</span>
                                <span>৳ {(order.total_amount - order.shipping_total).toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between">
                                <span>Shipping Fee</span>
                                <span>৳ {order.shipping_total.toLocaleString()}</span>
                            </div>
                        </div>
                        <div className="flex justify-between font-bold text-lg text-gray-900">
                            <span>Total Payment</span>
                            <span className="text-primary">৳ {order.total_amount.toLocaleString()}</span>
                        </div>
                    </div>

                    <div className="border rounded-lg p-5">
                        <h3 className="font-bold text-gray-900 mb-4">Tracking Status</h3>
                        <div className="flex flex-col gap-4">
                            {/* Simulated timeline */}
                            <div className="flex gap-3">
                                <div className="w-4 h-4 rounded-full bg-primary mt-1 shrink-0"></div>
                                <div>
                                    <div className="font-medium text-gray-900 text-sm">Package Delivered</div>
                                    <div className="text-xs text-gray-500">Your package has been signed.</div>
                                </div>
                            </div>
                            <div className="flex gap-3 relative">
                                <div className="w-4 h-4 rounded-full bg-gray-300 mt-1 shrink-0"></div>
                                <div className="absolute left-[7px] top-[-20px] bottom-[18px] w-[2px] bg-gray-300"></div>
                                <div>
                                    <div className="text-sm font-medium text-gray-500">Out for Delivery</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}
