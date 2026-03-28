"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuthStore } from "@/lib/authStore";
import { fetchAdminSalesAnalytics, type AdminSalesAnalytics } from "@/lib/api";

const formatDateOnly = (date: Date) => {
  const y = date.getUTCFullYear();
  const m = String(date.getUTCMonth() + 1).padStart(2, "0");
  const d = String(date.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const getDefaultRange = () => {
  const end = new Date();
  end.setUTCHours(0, 0, 0, 0);
  const start = new Date(end);
  start.setUTCDate(start.getUTCDate() - 29);
  return {
    start: formatDateOnly(start),
    end: formatDateOnly(end),
  };
};

export default function AdminAnalyticsPage() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  const defaultRange = getDefaultRange();
  const [startDate, setStartDate] = useState(defaultRange.start);
  const [endDate, setEndDate] = useState(defaultRange.end);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<AdminSalesAnalytics | null>(null);

  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, [hasInitialized, initializeFromStorage]);

  const loadAnalytics = async (sDate: string, eDate: string) => {
    setLoading(true);
    try {
      const data = await fetchAdminSalesAnalytics(sDate, eDate);
      setAnalytics(data);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to load analytics");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasInitialized) return;

    if (!isLoggedIn || !user?.is_admin) {
      router.push("/admin-login");
      return;
    }

    void loadAnalytics(startDate, endDate);
  }, [hasInitialized, isLoggedIn, router, user?.is_admin]);

  const handleApplyRange = () => {
    if (!startDate || !endDate) {
      toast.error("Please select both start and end dates");
      return;
    }
    if (startDate > endDate) {
      toast.error("Start date cannot be after end date");
      return;
    }
    void loadAnalytics(startDate, endDate);
  };

  const maxOrderCount = useMemo(() => {
    if (!analytics?.daily?.length) return 1;
    return Math.max(...analytics.daily.map((p) => p.order_count), 1);
  }, [analytics]);

  const revenuePath = useMemo(() => {
    if (!analytics?.daily?.length) return "";

    const points = analytics.daily;
    const width = 100;
    const height = 36;
    const maxValue = Math.max(...points.map((p) => p.gross_revenue), 1);

    return points
      .map((point, index) => {
        const x = points.length === 1 ? 0 : (index / (points.length - 1)) * width;
        const y = height - (point.gross_revenue / maxValue) * height;
        return `${index === 0 ? "M" : "L"}${x},${y}`;
      })
      .join(" ");
  }, [analytics]);

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="border-b bg-white">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <h1 className="text-2xl font-bold text-gray-900">Sales Analytics</h1>
          <p className="mt-1 text-gray-600">Daily orders, top sellers, and revenue trend</p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle>Date Range</CardTitle>
            <CardDescription>Select a date range for analytics</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3 md:grid-cols-4">
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="h-10 rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
            <Button onClick={handleApplyRange} disabled={loading}>
              {loading ? "Loading..." : "Apply"}
            </Button>
          </CardContent>
        </Card>

        {analytics && (
          <>
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total Orders</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{analytics.summary.total_orders.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Gross Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳ {analytics.summary.gross_revenue.toLocaleString()}</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Commission Revenue (1%)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">৳ {analytics.summary.commission_revenue.toLocaleString()}</div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Daily Order Count</CardTitle>
                  <CardDescription>Orders per day in selected range</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 overflow-x-auto">
                    <div className="flex h-full min-w-[640px] items-end gap-2 rounded-md border bg-white px-3 py-4">
                      {analytics.daily.map((point) => {
                        const barHeight = `${Math.max((point.order_count / maxOrderCount) * 100, 2)}%`;
                        return (
                          <div key={point.date} className="flex h-full flex-1 flex-col items-center justify-end gap-2 min-h-0">
                            <span className="text-[10px] font-medium text-gray-600">{point.order_count}</span>
                            <div
                              className="w-full rounded-t bg-orange-500 min-h-[2px]"
                              style={{ height: barHeight }}
                              title={`${point.date}: ${point.order_count} orders`}
                            ></div>
                            <span className="text-[10px] text-gray-500">{point.date.slice(5)}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Revenue Trend</CardTitle>
                  <CardDescription>Gross revenue over time</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 rounded-md border bg-white p-4">
                    {analytics.daily.length === 0 ? (
                      <div className="flex h-full items-center justify-center text-gray-500">No data</div>
                    ) : (
                      <svg viewBox="0 0 100 40" preserveAspectRatio="none" className="h-full w-full">
                        <path d={revenuePath} fill="none" stroke="#f97316" strokeWidth="1.5" />
                      </svg>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" />
                  Top-Selling Products
                </CardTitle>
                <CardDescription>Highest selling products in selected range</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[760px] border-collapse text-sm">
                    <thead>
                      <tr className="border-b bg-gray-100 text-left">
                        <th className="p-3 font-semibold">Product</th>
                        <th className="p-3 font-semibold">Brand</th>
                        <th className="p-3 font-semibold">Units Sold</th>
                        <th className="p-3 font-semibold">Gross Sales</th>
                        <th className="p-3 font-semibold">Commission (1%)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {analytics.top_products.map((product) => (
                        <tr key={product.id} className="border-b">
                          <td className="p-3 font-medium text-gray-900">{product.name}</td>
                          <td className="p-3">{product.brand || "-"}</td>
                          <td className="p-3">{product.units_sold}</td>
                          <td className="p-3">৳ {product.gross_sales.toLocaleString()}</td>
                          <td className="p-3">৳ {product.commission_revenue.toLocaleString()}</td>
                        </tr>
                      ))}
                      {analytics.top_products.length === 0 && (
                        <tr>
                          <td colSpan={5} className="p-6 text-center text-gray-500">
                            No sales data in this range.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </main>
    </div>
  );
}
