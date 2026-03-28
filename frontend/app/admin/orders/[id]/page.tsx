"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminOrderById, type AdminOrderDetails } from "@/lib/api";

export default function AdminOrderDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [resolvedId, setResolvedId] = useState<string>("");
  const [order, setOrder] = useState<AdminOrderDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, [hasInitialized, initializeFromStorage]);

  useEffect(() => {
    (async () => {
      const { id } = await params;
      setResolvedId(id);
    })();
  }, [params]);

  useEffect(() => {
    if (!hasInitialized || !resolvedId) return;
    if (!isLoggedIn || !user?.is_admin) {
      router.push("/admin-login");
      return;
    }

    const loadOrder = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminOrderById(resolvedId);
        setOrder(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load order details");
      } finally {
        setLoading(false);
      }
    };

    void loadOrder();
  }, [hasInitialized, isLoggedIn, router, user?.is_admin, resolvedId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading order details...</div>;
  }

  if (!order) {
    return <div className="p-8 text-center text-gray-500">Order not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/orders">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
              <p className="text-sm text-gray-600">Order ID: {order.id}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {order.order_items.map((item) => (
                <div key={item.id} className="flex items-center justify-between gap-4 border-b pb-4">
                  <div className="flex items-center gap-4">
                    <div className="relative h-16 w-16 overflow-hidden rounded bg-gray-100">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.product_name}
                          fill
                          sizes="64px"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{item.product_name}</p>
                      <p className="text-sm text-gray-500">Brand: {item.brand || "-"}</p>
                      <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                    </div>
                  </div>
                  <p className="font-semibold">৳ {item.price.toLocaleString()}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Name:</span> {order.user.name}</p>
              <p><span className="font-semibold">Email:</span> {order.user.email}</p>
              <p><span className="font-semibold">Phone:</span> {order.user.phone || "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Status:</span> {order.order_status}</p>
              <p><span className="font-semibold">Payment Method:</span> {order.payment_method}</p>
              <p><span className="font-semibold">Payment Status:</span> {order.payment_status}</p>
              <p><span className="font-semibold">Address:</span> {order.shipping_address}</p>
              <p><span className="font-semibold">Date:</span> {new Date(order.created_at).toLocaleString()}</p>
              <p className="pt-2 text-base font-bold">Total: ৳ {order.total_amount.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
