"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";

export default function MyOrdersPage() {
    // Mock API structure
    const orders = [
        {
            id: "ORD-987654321",
            total_amount: 139999.0,
            order_status: "Delivered",
            created_at: "2026-03-15T10:00:00Z",
            items: [
                {
                    order_item_id: 1,
                    product_id: "s24u-123",
                    name: "Samsung Galaxy S24 Ultra 5G",
                    quantity: 1,
                    image_url: ""
                }
            ]
        },
        {
            id: "ORD-123456789",
            total_amount: 5000.0,
            order_status: "Processing",
            created_at: "2026-03-18T09:30:00Z",
            items: [
                {
                    order_item_id: 2,
                    product_id: "appl-521",
                    name: "Apple 20W USB-C Power Adapter",
                    quantity: 2,
                    image_url: ""
                },
                {
                    order_item_id: 3,
                    product_id: "cbl-002",
                    name: "Apple USB-C to Lightning Cable",
                    quantity: 1,
                    image_url: ""
                }
            ]
        }
    ];

    const getStatusColor = (status: string) => {
        switch (status.toLowerCase()) {
            case "delivered": return "bg-green-100 text-green-700";
            case "processing": return "bg-blue-100 text-blue-700";
            case "cancelled": return "bg-red-100 text-red-700";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">My Orders</h1>

            {orders.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500 mb-4">You haven't placed any orders yet.</p>
                    <Link href="/search">
                        <Button className="bg-primary hover:bg-primary/90">Start Shopping</Button>
                    </Link>
                </div>
            ) : (
                <div className="space-y-6">
                    <Accordion multiple className="w-full space-y-4">
                        {orders.map(order => (
                            <AccordionItem value={order.id} key={order.id} className="border rounded-lg px-5 hover:border-gray-300 transition-colors">
                                <AccordionTrigger className="hover:no-underline py-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-4 text-left">
                                        <div>
                                            <div className="font-semibold text-gray-900">Order #{order.id}</div>
                                            <div className="text-sm font-normal text-gray-500">Placed on {new Date(order.created_at).toLocaleDateString()}</div>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            <span className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.order_status)}`}>
                                                {order.order_status}
                                            </span>
                                            <div className="font-bold text-gray-900 shrink-0">
                                                Total: ৳ {order.total_amount.toLocaleString()}
                                            </div>
                                        </div>
                                    </div>
                                </AccordionTrigger>
                                <AccordionContent className="pb-4 pt-2 border-t">
                                    <div className="space-y-4">
                                        {order.items.map((item, idx) => (
                                            <div key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">
                                                        Image
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <Link href={`/product/${item.product_id}`} className="font-medium text-gray-900 hover:text-primary transition-colors text-sm sm:text-base">
                                                            {item.name}
                                                        </Link>
                                                        <span className="text-sm text-gray-500 mt-1">Qty: {item.quantity}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* View deeper details */}
                                    <div className="mt-4 pt-4 border-t flex justify-end">
                                        <Link href={`/profile/orders/${order.id}`}>
                                            <Button variant="outline" className="text-primary hover:text-primary hover:bg-orange-50 border-orange-200">
                                                View Full Details <ChevronRight className="ml-1 w-4 h-4" />
                                            </Button>
                                        </Link>
                                    </div>

                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </div>
            )}
        </div>
    );
}
