"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { fetchOrderById } from "@/lib/api";

export default function OrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(
    null,
  );
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Resolve params once
  useEffect(() => {
    (async () => {
      const resolved = await params;
      setResolvedParams(resolved);
    })();
  }, [params]);

  // Fetch order when params are resolved
  useEffect(() => {
    if (!resolvedParams?.id) return;

    const loadOrder = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log("[OrderDetails] Fetching order:", resolvedParams.id);
        const response = await fetchOrderById(resolvedParams.id);
        console.log("[OrderDetails] Order fetched:", response);
        setOrder(response.data);
      } catch (err: any) {
        console.error("[OrderDetails] Error:", err);
        if (err.message.includes("Unauthorized")) {
          setError("Please login to view order details");
          setTimeout(() => router.push("/login"), 2000);
        } else {
          setError(err.message || "Failed to load order");
        }
      } finally {
        setLoading(false);
      }
    };

    loadOrder();
  }, [resolvedParams, router]);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          Loading order details...
        </h1>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h1 className="text-2xl font-bold text-red-600 mb-6">Error</h1>
        <p className="text-gray-600 mb-8">{error || "Order not found"}</p>
        <Link href="/profile/orders">
          <Button variant="outline">Back to Orders</Button>
        </Link>
      </div>
    );
  }

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

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      {/* Header */}
      <div className="flex items-center gap-4 mb-8">
        <Link href="/profile/orders">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-full hover:bg-gray-100"
          >
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
              {order.order_items && order.order_items.length > 0 ? (
                order.order_items.map((item: any) => (
                  <div
                    key={item.id}
                    className="flex gap-4 pb-4 border-b last:border-b-0"
                  >
                    <div className="w-20 h-20 bg-gray-100 rounded flex items-center justify-center shrink-0">
                      <span className="text-xs text-gray-400">Image</span>
                    </div>
                    <div className="flex-1">
                      <Link
                        href={`/product/${item.product_id}`}
                        className="font-medium text-gray-900 hover:text-primary transition-colors"
                      >
                        {item.product_name || "Product"}
                      </Link>
                      <div className="text-sm text-gray-500 mt-1">
                        Qty: {item.quantity}
                      </div>
                    </div>
                    <div className="text-right font-bold text-gray-900">
                      ৳ {item.price.toLocaleString()}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-gray-500">No items in this order</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Shipping Address
              </h3>
              <p className="text-gray-700 text-sm">{order.shipping_address}</p>
            </div>
            <div className="border rounded-lg p-5">
              <h3 className="font-semibold text-gray-900 mb-3 text-sm uppercase tracking-wide">
                Payment Method
              </h3>
              <p className="text-gray-700 text-sm">
                {order.payment_method || "N/A"}
              </p>
              <p
                className={`font-medium text-sm mt-2 ${
                  order.payment_status === "Paid"
                    ? "text-green-600"
                    : "text-yellow-600"
                }`}
              >
                {order.payment_status === "Paid"
                  ? "Payment Completed"
                  : "Payment Pending"}
              </p>
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
                <span>৳ {(order.total_amount - 60).toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping Fee</span>
                <span>৳ 60</span>
              </div>
            </div>
            <div className="flex justify-between font-bold text-lg text-gray-900">
              <span>Total Payment</span>
              <span className="text-primary">
                ৳ {order.total_amount.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="border rounded-lg p-5">
            <h3 className="font-bold text-gray-900 mb-4">Order Status</h3>
            <div className="flex items-center gap-3">
              <span
                className={`px-3 py-2 rounded-full text-sm uppercase font-bold tracking-wider ${getStatusColor(
                  order.order_status,
                )}`}
              >
                {order.order_status}
              </span>
            </div>
            <p className="text-xs text-gray-500 mt-3">
              Order placed on {new Date(order.created_at).toLocaleDateString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
