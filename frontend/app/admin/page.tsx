"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { LogOut, BarChart3, Users, ShoppingCart, TrendingUp } from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboard() {
  const router = useRouter();
  const { user, isLoggedIn, clearAuth, hasInitialized, initializeFromStorage } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  // Initialize from storage on mount only
  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, []); // Empty dependency array - only run on mount

  // Check auth status and protect page
  useEffect(() => {
    if (hasInitialized) {
      console.log("=== Admin Page Auth Check ===");
      console.log("isLoggedIn:", isLoggedIn);
      console.log("user:", user);
      console.log("user?.is_admin:", user?.is_admin);
      
      if (!isLoggedIn || !user?.is_admin) {
        console.log("Access denied - redirecting to admin-login");
        router.push("/admin-login");
      } else {
        console.log("Access granted - loading dashboard");
        setIsLoading(false);
      }
    }
  }, [hasInitialized, isLoggedIn, user?.is_admin, router]);

  const handleLogout = () => {
    clearAuth();
    toast.success("Logged out successfully");
    router.push("/");
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="mb-4 inline-block h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-gray-600">Loading admin dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="mt-1 text-gray-600">Welcome back, {user?.name}!</p>
          </div>
          <Button
            onClick={handleLogout}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Stats Grid */}
        <div className="mb-8 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Total Users */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-gray-600">+12% from last month</p>
            </CardContent>
          </Card>

          {/* Total Orders */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">5,678</div>
              <p className="text-xs text-gray-600">+8% from last month</p>
            </CardContent>
          </Card>

          {/* Revenue */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">৳ 2.5M</div>
              <p className="text-xs text-gray-600">+15% from last month</p>
            </CardContent>
          </Card>

          {/* Products */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Products</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-gray-600">+5 new this month</p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity Section */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
              <CardDescription>Manage your store</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  View Products
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  View Orders
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  View Users
                </Button>
              </Link>
              <Link href="/admin">
                <Button variant="outline" className="w-full">
                  Settings
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Admin Info */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle>Admin Account Info</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Name:</span>
                  <span className="font-semibold">{user?.name}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Email:</span>
                  <span className="font-semibold">{user?.email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800">
                    Active Admin
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
