"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ChevronRight } from "lucide-react";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import { fetchOrders } from "@/lib/api";

export default function MyOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch orders on component mount
  useEffect(() => {
    const loadOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetchOrders();
        setOrders(response.data || []);
      } catch (err: any) {
        if (err.message.includes("Unauthorized")) {
          setError("Please login to view orders");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(err.message || "Failed to load orders");
        }
        setOrders([]);
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delivered":
        return "bg-green-100 text-green-700";
      case "processing":
        return "bg-blue-100 text-blue-700";
      case "pending":
        return "bg-yellow-100 text-yellow-700";
      case "cancelled":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          My Orders
        </h1>
        <div className="text-center py-10">
          <p className="text-gray-500">Loading your orders...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
          My Orders
        </h1>
        <div className="text-center py-10">
          <p className="text-red-600 mb-4">{error}</p>
          <Link href="/search">
            <Button className="bg-primary hover:bg-primary/90">
              Continue Shopping
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6 border-b pb-4">
        My Orders
      </h1>

      {orders.length === 0 ? (
        <div className="text-center py-10">
          <p className="text-gray-500 mb-4">
            You haven&apos;t placed any orders yet.
          </p>
          <Link href="/search">
            <Button className="bg-primary hover:bg-primary/90">
              Start Shopping
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          <Accordion multiple className="w-full space-y-4">
            {orders.map((order) => (
              <AccordionItem
                value={order.id.toString()}
                key={order.id}
                className="border rounded-lg px-5 hover:border-gray-300 transition-colors"
              >
                <AccordionTrigger className="hover:no-underline py-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 w-full pr-4 text-left">
                    <div>
                      <div className="font-semibold text-gray-900">
                        Order #{order.id}
                      </div>
                      <div className="text-sm font-normal text-gray-500">
                        Placed on{" "}
                        {new Date(order.created_at).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span
                        className={`px-3 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.order_status)}`}
                      >
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
                    {order.order_items &&
                      order.order_items.map((item: any, idx: number) => (
                        <div
                          key={idx}
                          className="flex items-center justify-between"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400 relative">
                              {item.image_url ? (
                                <Image
                                  src={item.image_url}
                                  alt={item.product_name}
                                  fill
                                  sizes="64px"
                                  className="object-cover rounded"
                                />
                              ) : (
                                <span className="text-xs text-gray-400">
                                  No Image
                                </span>
                              )}
                            </div>
                            <div className="flex flex-col">
                              <Link
                                href={`/product/${item.product_id}`}
                                className="font-medium text-gray-900 hover:text-primary transition-colors text-sm sm:text-base"
                              >
                                {item.product_name || "Product"}
                              </Link>
                              <span className="text-sm text-gray-500 mt-1">
                                Qty: {item.quantity}
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium text-gray-900">
                              ৳ {item.price.toLocaleString()}
                            </p>
                          </div>
                        </div>
                      ))}
                  </div>

                  {/* View deeper details */}
                  <div className="mt-4 pt-4 border-t flex justify-end">
                    <Link href={`/profile/orders/${order.id}`}>
                      <Button
                        variant="outline"
                        className="text-primary hover:text-primary hover:bg-orange-50 border-orange-200"
                      >
                        View Full Details{" "}
                        <ChevronRight className="ml-1 w-4 h-4" />
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
