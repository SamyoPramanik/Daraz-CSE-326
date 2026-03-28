"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminUsers, type AdminUserInfo } from "@/lib/api";

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const [users, setUsers] = useState<AdminUserInfo[]>([]);
  const [loading, setLoading] = useState(true);

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

    const loadUsers = async () => {
      setLoading(true);
      try {
        const data = await fetchAdminUsers();
        setUsers(data);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : "Failed to load users");
      } finally {
        setLoading(false);
      }
    };

    void loadUsers();
  }, [hasInitialized, isLoggedIn, router, user?.is_admin]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Users</h1>
            <p className="mt-1 text-gray-600">All users and their details</p>
          </div>
          <Link href="/admin">
            <Button variant="outline">Back to Dashboard</Button>
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>User List</CardTitle>
            <CardDescription>Online/offline status and account summary</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p className="py-8 text-center text-gray-500">Loading users...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[980px] border-collapse text-sm">
                  <thead>
                    <tr className="border-b bg-gray-100 text-left">
                      <th className="p-3 font-semibold">Name</th>
                      <th className="p-3 font-semibold">Email</th>
                      <th className="p-3 font-semibold">Phone</th>
                      <th className="p-3 font-semibold">Status</th>
                      <th className="p-3 font-semibold">Orders</th>
                      <th className="p-3 font-semibold">Total Spent</th>
                      <th className="p-3 font-semibold">Last Activity</th>
                      <th className="p-3 font-semibold">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((item) => (
                      <tr key={item.id} className="border-b">
                        <td className="p-3 font-medium text-gray-900">{item.name}</td>
                        <td className="p-3">{item.email}</td>
                        <td className="p-3">{item.phone || "-"}</td>
                        <td className="p-3">
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold ${
                              item.status === "Online"
                                ? "bg-green-100 text-green-700"
                                : "bg-gray-200 text-gray-700"
                            }`}
                          >
                            {item.status}
                          </span>
                        </td>
                        <td className="p-3">{item.total_orders}</td>
                        <td className="p-3">৳ {item.total_spent.toLocaleString()}</td>
                        <td className="p-3">{new Date(item.last_activity_at).toLocaleString()}</td>
                        <td className="p-3">
                          <Link href={`/admin/users/${item.id}`}>
                            <Button size="sm" variant="outline">View Details</Button>
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
