"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminOrders, type AdminOrderSummary } from "@/lib/api";

const getStatusColor = (status: string) => {
  switch (status?.toLowerCase()) {
    case "delivered":
      return "bg-green-100 text-green-700";
    case "paid":
      return "bg-emerald-100 text-emerald-700";
    case "confirmed":
      return "bg-blue-100 text-blue-700";
    case "pending":
      return "bg-yellow-100 text-yellow-700";
    case "failed":
      return "bg-red-100 text-red-700";
    default:
      return "bg-gray-100 text-gray-700";
  }
};

export default function AdminOrdersPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [orders, setOrders] = useState<AdminOrderSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [nameFilter, setNameFilter] = useState("");

  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, [hasInitialized, initializeFromStorage]);

  useEffect(() => {
    if (!hasInitialized) return;
    if (!isLoggedIn || !user?.is_admin) {
      router.push("/admin-login");
      return;
    }

    const loadOrders = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminOrders(nameFilter);
        setOrders(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load orders");
      } finally {
        setLoading(false);
      }
    };

    const timeout = setTimeout(() => {
      void loadOrders();
    }, 350);

    return () => clearTimeout(timeout);
  }, [hasInitialized, isLoggedIn, router, user?.is_admin, nameFilter]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">All Orders</h1>
            <p className="mt-1 text-gray-600">Manage orders across all users</p>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Orders</CardTitle>
            <CardDescription>Filter by user name and manage order status</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="mb-4 flex items-center gap-2">
              <Search className="h-4 w-4 text-gray-500" />
              <Input
                placeholder="Filter by user name"
                value={nameFilter}
                onChange={(e) => setNameFilter(e.target.value)}
                className="max-w-md"
              />
            </div>

            {loading ? (
              <p className="py-8 text-center text-gray-500">Loading orders...</p>
            ) : orders.length === 0 ? (
              <p className="py-8 text-center text-gray-500">No orders found.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[960px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-100 text-left">
                      <th className="p-3 font-semibold">Order ID</th>
                      <th className="p-3 font-semibold">User</th>
                      <th className="p-3 font-semibold">Items</th>
                      <th className="p-3 font-semibold">Amount</th>
                      <th className="p-3 font-semibold">Payment</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Date</th>
                      <th className="p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.map((order) => (
                      <tr key={order.id} className="border-b hover:bg-gray-50 transition-colors">
                        <td className="p-3 font-mono text-xs">{order.id.substring(0, 8)}...</td>
                        <td className="p-3">
                          <div>
                            <p className="font-medium">{order.user_name}</p>
                            <p className="text-xs text-gray-500">{order.user_email}</p>
                          </div>
                        </td>
                        <td className="p-3">{order.total_items}</td>
                        <td className="p-3 font-medium">৳ {order.total_amount.toLocaleString()}</td>
                        <td className="p-3">
                          <span className="px-2 py-1 rounded text-xs font-medium bg-gray-100 text-gray-700">
                            {order.payment_method}
                          </span>
                        </td>
                        <td className="p-3">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] uppercase font-bold tracking-wider ${getStatusColor(order.order_status)}`}
                          >
                            {order.order_status}
                          </span>
                        </td>
                        <td className="p-3 text-gray-500">
                          {new Date(order.created_at).toLocaleDateString()}
                        </td>
                        <td className="p-3">
                          <Link href={`/admin/orders/${order.id}`}>
                            <Button size="sm" variant="outline">Manage</Button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
