"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, User, ShoppingBag, Clock, ShoppingCart } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminUserById, type AdminUserDetails } from "@/lib/api";

function getStatusInfo(lastSeenAt: string | null | undefined): {
  label: string;
  dotClass: string;
  badgeClass: string;
  lastSeenText: string;
} {
  if (!lastSeenAt) {
    return {
      label: "Never Seen",
      dotClass: "bg-gray-300",
      badgeClass: "bg-gray-100 text-gray-500",
      lastSeenText: "No activity recorded yet",
    };
  }

  const lastSeen = new Date(lastSeenAt);
  const now = new Date();
  const diffMs = now.getTime() - lastSeen.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  let label = "Offline";
  let dotClass = "bg-gray-400";
  let badgeClass = "bg-gray-100 text-gray-600";

  if (diffMin < 5) {
    label = "Online";
    dotClass = "bg-green-500 animate-pulse";
    badgeClass = "bg-green-100 text-green-700";
  } else if (diffMin < 30) {
    label = "Recently Active";
    dotClass = "bg-yellow-400";
    badgeClass = "bg-yellow-100 text-yellow-700";
  }

  let lastSeenText: string;
  if (diffMin < 1) lastSeenText = "Just now";
  else if (diffMin < 60) lastSeenText = `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  else {
    const h = Math.floor(diffMin / 60);
    if (h < 24) lastSeenText = `${h} hour${h > 1 ? "s" : ""} ago`;
    else lastSeenText = lastSeen.toLocaleString();
  }

  return { label, dotClass, badgeClass, lastSeenText };
}

const ORDER_STATUS_COLORS: Record<string, string> = {
  Pending: "bg-yellow-100 text-yellow-700",
  Confirmed: "bg-blue-100 text-blue-700",
  Paid: "bg-green-100 text-green-700",
  Delivered: "bg-emerald-100 text-emerald-700",
  Failed: "bg-red-100 text-red-700",
  Cancelled: "bg-gray-100 text-gray-600",
};

export default function AdminUserDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } =
    useAuthStore();

  const [resolvedId, setResolvedId] = useState<string>("");
  const [userDetails, setUserDetails] = useState<AdminUserDetails | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!hasInitialized) initializeFromStorage();
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
        toast.error(
          error instanceof Error ? error.message : "Failed to load user details",
        );
      } finally {
        setLoading(false);
      }
    };
    void loadDetails();
  }, [hasInitialized, isLoggedIn, router, user?.is_admin, resolvedId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">Loading user details...</p>
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p className="text-gray-500">User not found.</p>
      </div>
    );
  }

  const { label, dotClass, badgeClass, lastSeenText } = getStatusInfo(
    userDetails.last_seen_at,
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/admin/users">
              <Button variant="outline" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">User Details</h1>
              <p className="text-sm text-gray-500">{userDetails.email}</p>
            </div>
          </div>
          {/* Live status badge in header */}
          <span
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ${badgeClass}`}
          >
            <span className={`h-2 w-2 rounded-full ${dotClass}`} />
            {label}
          </span>
        </div>
      </header>

      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:px-6 lg:grid-cols-3 lg:px-8">
        {/* Left column */}
        <div className="lg:col-span-1 space-y-5">
          {/* Profile */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4 text-gray-500" /> Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Name</p>
                <p className="font-medium text-gray-900">{userDetails.name}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Email</p>
                <p className="text-gray-700">{userDetails.email}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Phone</p>
                <p className="text-gray-700">{userDetails.phone || "—"}</p>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Member Since</p>
                <p className="text-gray-700">
                  {new Date(userDetails.created_at).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Activity */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <Clock className="h-4 w-4 text-gray-500" /> Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Current Status</p>
                <span
                  className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
                >
                  <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                  {label}
                </span>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Last API Activity</p>
                <p className="font-medium text-gray-800">{lastSeenText}</p>
                {userDetails.last_seen_at && (
                  <p className="text-xs text-gray-400 mt-0.5">
                    {new Date(userDetails.last_seen_at).toLocaleString()}
                  </p>
                )}
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Last Cart Activity</p>
                <p className="text-gray-700">
                  {userDetails.last_cart_at
                    ? new Date(userDetails.last_cart_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Order Summary */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-base">
                <ShoppingBag className="h-4 w-4 text-gray-500" /> Order Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-blue-50 p-3 text-center">
                  <p className="text-2xl font-bold text-blue-700">
                    {userDetails.total_orders}
                  </p>
                  <p className="text-xs text-blue-500">Total Orders</p>
                </div>
                <div className="rounded-lg bg-green-50 p-3 text-center">
                  <p className="text-lg font-bold text-green-700">
                    ৳ {Number(userDetails.total_spent).toLocaleString()}
                  </p>
                  <p className="text-xs text-green-500">Total Spent</p>
                </div>
              </div>
              <div>
                <p className="text-xs text-gray-400 mb-0.5">Last Order</p>
                <p className="text-gray-700">
                  {userDetails.last_order_at
                    ? new Date(userDetails.last_order_at).toLocaleString()
                    : "—"}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right column — Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5 text-gray-500" /> Recent Orders
              </CardTitle>
            </CardHeader>
            <CardContent>
              {userDetails.recent_orders.length === 0 ? (
                <p className="py-8 text-center text-sm text-gray-400">
                  No orders found for this user.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[640px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                        <th className="p-3">Order ID</th>
                        <th className="p-3">Items</th>
                        <th className="p-3">Status</th>
                        <th className="p-3">Payment</th>
                        <th className="p-3">Amount</th>
                        <th className="p-3">Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {userDetails.recent_orders.map((order) => (
                        <tr
                          key={order.id}
                          className="border-b hover:bg-gray-50 transition-colors"
                        >
                          <td className="p-3 font-mono text-xs text-gray-500">
                            {order.id.slice(0, 8)}…
                          </td>
                          <td className="p-3 text-center">{order.total_items}</td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                ORDER_STATUS_COLORS[order.order_status] ??
                                "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {order.order_status}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                                order.payment_status === "Paid"
                                  ? "bg-green-100 text-green-700"
                                  : order.payment_status === "Failed"
                                    ? "bg-red-100 text-red-700"
                                    : "bg-gray-100 text-gray-600"
                              }`}
                            >
                              {order.payment_status}
                            </span>
                          </td>
                          <td className="p-3 font-medium">
                            ৳ {Number(order.total_amount).toLocaleString()}
                          </td>
                          <td className="p-3 text-xs text-gray-500">
                            {new Date(order.created_at).toLocaleDateString()}
                          </td>
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
