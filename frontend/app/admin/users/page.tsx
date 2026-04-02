"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminUsers, type AdminUserInfo } from "@/lib/api";

function getStatusInfo(item: AdminUserInfo): {
  label: string;
  dotClass: string;
  badgeClass: string;
  lastSeenText: string;
} {
  const lastSeen = item.last_seen_at ? new Date(item.last_seen_at) : null;
  const lastActivity = item.last_activity_at ? new Date(item.last_activity_at) : null;
  const now = new Date();

  // Compute minutes since last API activity
  const diffMs = lastSeen ? now.getTime() - lastSeen.getTime() : Infinity;
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

  let lastSeenText = "-";
  const ref = lastSeen ?? lastActivity;
  if (ref) {
    if (diffMin < 1) lastSeenText = "Just now";
    else if (diffMin < 60) lastSeenText = `${diffMin}m ago`;
    else {
      const h = Math.floor(diffMin / 60);
      if (h < 24) lastSeenText = `${h}h ago`;
      else lastSeenText = ref.toLocaleDateString();
    }
  }

  return { label, dotClass, badgeClass, lastSeenText };
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } =
    useAuthStore();

  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);

  useEffect(() => {
    if (!hasInitialized) initializeFromStorage();
  }, [hasInitialized, initializeFromStorage]);

  const loadUsers = useCallback(async () => {
    setLoading(true);
    try {
      const data = await fetchAdminUsers();
      setUsers(data);
      setLastRefreshed(new Date());
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to load users",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasInitialized) return;
    if (!isLoggedIn || !user?.is_admin) {
      router.push("/admin-login");
      return;
    }
    void loadUsers();

    // Auto-refresh every 30 seconds for live status
    const interval = setInterval(() => void loadUsers(), 30_000);
    return () => clearInterval(interval);
  }, [hasInitialized, isLoggedIn, router, user?.is_admin, loadUsers]);

  const onlineCount = users.filter((u) => {
    const lastSeen = u.last_seen_at ? new Date(u.last_seen_at) : null;
    return lastSeen && new Date().getTime() - lastSeen.getTime() < 5 * 60000;
  }).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white shadow-sm">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Users</h1>
              <p className="mt-0.5 text-sm text-gray-500">
                {onlineCount > 0 ? (
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500 animate-pulse inline-block" />
                    <span className="text-green-600 font-medium">{onlineCount} online now</span>
                    <span className="text-gray-400">· {users.length} total</span>
                  </span>
                ) : (
                  `${users.length} users`
                )}
              </p>
            </div>
            <div className="flex items-center gap-2">
              {lastRefreshed && (
                <span className="text-xs text-gray-400 hidden sm:inline">
                  Updated {lastRefreshed.toLocaleTimeString()}
                </span>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => void loadUsers()}
                disabled={loading}
                className="gap-1.5"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </Button>
              {/* <Link href="/admin/audit-logs">
                <Button variant="outline" size="sm" className="gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  View Logs
                </Button>
              </Link> */}
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>
              Online = active in last 5 min &nbsp;·&nbsp; Recently Active = last 30 min &nbsp;·&nbsp; Offline = inactive
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading && users.length === 0 ? (
              <p className="py-8 text-center text-gray-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1000px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                      <th className="p-3">Name</th>
                      <th className="p-3">Email</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Status</th>
                      <th className="p-3">Last Seen</th>
                      <th className="p-3">Orders</th>
                      <th className="p-3">Total Spent</th>
                      <th className="p-3">Last Cart</th>
                      <th className="p-3">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => {
                      const { label, dotClass, badgeClass, lastSeenText } =
                        getStatusInfo(item);
                      return (
                        <tr key={item.id} className="border-b hover:bg-gray-50 transition-colors">
                          <td className="p-3 font-medium text-gray-900">
                            {item.name}
                          </td>
                          <td className="p-3 text-gray-600">{item.email}</td>
                          <td className="p-3 text-gray-600">
                            {item.phone || "-"}
                          </td>
                          <td className="p-3">
                            <span
                              className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
                            >
                              <span className={`h-1.5 w-1.5 rounded-full ${dotClass}`} />
                              {label}
                            </span>
                          </td>
                          <td className="p-3 text-xs text-gray-500">
                            {lastSeenText}
                          </td>
                          <td className="p-3">{item.total_orders}</td>
                          <td className="p-3">
                            ৳ {Number(item.total_spent).toLocaleString()}
                          </td>
                          <td className="p-3 text-xs text-gray-500">
                            {item.last_cart_at
                              ? new Date(item.last_cart_at).toLocaleString()
                              : "-"}
                          </td>
                          <td className="p-3">
                            <Link href={`/admin/users/${item.id}`}>
                              <Button size="sm" variant="outline">
                                View Details
                              </Button>
                            </Link>
                          </td>
                        </tr>
                      );
                    })}
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
