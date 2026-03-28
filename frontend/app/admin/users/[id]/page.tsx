"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminUserById, type AdminUserDetails } from "@/lib/api";

export default function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [resolvedId, setResolvedId] = useState<string>("");
  const [userDetails, setUserDetails] = useState<AdminUserDetails | null>(null);
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

    const loadDetails = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminUserById(resolvedId);
        setUserDetails(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load user details");
      } finally {
        setLoading(false);
      }
    };

    void loadDetails();
  }, [hasInitialized, isLoggedIn, router, user?.is_admin, resolvedId]);

  if (loading) {
    return <div className="p-8 text-center text-gray-500">Loading user details...</div>;
  }

  if (!userDetails) {
    return <div className="p-8 text-center text-gray-500">User not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-sm text-gray-600">{userDetails.name}</p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        <div className="lg:col-span-1 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Name:</span> {userDetails.name}</p>
              <p><span className="font-semibold">Email:</span> {userDetails.email}</p>
              <p><span className="font-semibold">Phone:</span> {userDetails.phone || "-"}</p>
              <p>
                <span className="font-semibold">Status:</span>{" "}
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    userDetails.status === "Online"
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-200 text-gray-700"
                  }`}
                >
                  {userDetails.status}
                </span>
              </p>
              <p><span className="font-semibold">Joined:</span> {new Date(userDetails.created_at).toLocaleString()}</p>
              <p><span className="font-semibold">Last Seen:</span> {userDetails.last_seen_at ? new Date(userDetails.last_seen_at).toLocaleString() : "-"}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p><span className="font-semibold">Total Orders:</span> {userDetails.total_orders}</p>
              <p><span className="font-semibold">Total Spent:</span> ৳ {userDetails.total_spent.toLocaleString()}</p>
              <p><span className="font-semibold">Last Order:</span> {userDetails.last_order_at ? new Date(userDetails.last_order_at).toLocaleString() : "-"}</p>
              <p><span className="font-semibold">Last Cart Activity:</span> {userDetails.last_cart_at ? new Date(userDetails.last_cart_at).toLocaleString() : "-"}</p>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
            </CardHeader>
            <CardContent>
              {userDetails.recent_orders.length === 0 ? (
                <p className="text-sm text-gray-500">No orders found for this user.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[700px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-100 text-left">
                        <th className="p-3 font-semibold">Order ID</th>
                        <th className="p-3 font-semibold">Items</th>
                        <th className="p-3 font-semibold">Status</th>
                        <th className="p-3 font-semibold">Payment</th>
                        <th className="p-3 font-semibold">Amount</th>
                        <th className="p-3 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.recent_orders.map((order) => (
                        <tr key={order.id} className="border-b">
                          <td className="p-3 font-mono text-xs">{order.id}</td>
                          <td className="p-3">{order.total_items}</td>
                          <td className="p-3">{order.order_status}</td>
                          <td className="p-3">{order.payment_status}</td>
                          <td className="p-3">৳ {order.total_amount.toLocaleString()}</td>
                          <td className="p-3">{new Date(order.created_at).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
