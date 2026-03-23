"use client";

import Link from "next/link";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Lock } from "lucide-react";

const BASE_URL =
  typeof window === "undefined"
    ? process.env.NEXT_INTERNAL_SERVER_URL || "http://backend:4000"
    : "/api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch(`${BASE_URL}/auth/admin/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok && data.status === "success") {
        localStorage.setItem("token", data.data.token);
        localStorage.setItem("user", JSON.stringify(data.data.user));

        toast.success("✅ Login successful!");
        
        // TODO: Redirect to /admin in Phase 6
        console.log("Admin logged in successfully");
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      console.error("Login error", error);
      toast.error("An error occurred during login.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-orange-100 px-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="space-y-2 border-b bg-gradient-to-r from-orange-500 to-orange-600 text-white">
          <div className="flex items-center gap-2 justify-center">
            <Lock className="h-6 w-6" />
            <CardTitle className="text-2xl">Admin Portal</CardTitle>
          </div>
          <CardDescription className="text-orange-100">
            Admin access only
          </CardDescription>
        </CardHeader>

        <CardContent className="pt-6">
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <Input
                id="email"
                type="email"
                placeholder="admin@daraz.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="border-orange-200 focus-visible:ring-orange-500"
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="border-orange-200 focus-visible:ring-orange-500"
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? "Logging in..." : "Admin Login"}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="flex flex-col gap-2 border-t bg-gray-50">
          <p className="text-sm text-gray-600 text-center w-full">
            Not an admin?{" "}
            <Link href="/login" className="text-orange-600 hover:text-orange-700 font-semibold">
              Regular Login
            </Link>
          </p>
          <p className="text-xs text-gray-500 text-center w-full">
            <Link href="/" className="text-gray-600 hover:text-gray-700 underline">
              Back to Home
            </Link>
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
