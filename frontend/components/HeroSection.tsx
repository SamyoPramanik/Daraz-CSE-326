"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";
import { useState, useEffect } from "react";

export default function HeroSection() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mounted, setMounted] = useState(false);

  // Check auth state on mount and listen for changes
  useEffect(() => {
    // Mark component as mounted to prevent hydration mismatches
    setMounted(true);

    const checkAuthState = () => {
      if (typeof window !== "undefined") {
        const token = localStorage.getItem("token");
        setIsLoggedIn(!!token);
      }
    };

    // Check on initial load
    checkAuthState();

    // Listen for storage changes (when logged in/out in another tab)
    window.addEventListener("storage", checkAuthState);

    // Also listen for custom auth change event (from login/register)
    const handleAuthChange = () => {
      checkAuthState();
    };
    window.addEventListener("authStateChanged", handleAuthChange);

    return () => {
      window.removeEventListener("storage", checkAuthState);
      window.removeEventListener("authStateChanged", handleAuthChange);
    };
  }, []);

  return (
    <section className="mb-12 rounded-2xl bg-orange-100 p-8 text-center md:text-left">
      <div className="max-w-2xl">
        <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
          Welcome to Daraz
        </h1>
        <p className="mb-6 text-lg text-gray-700">
          Discover the best deals on millions of products spanning electronics,
          fashion, home goods, and more.
        </p>
        <div className="flex gap-3 flex-wrap">
          <Link href="/search">
            <Button
              size="lg"
              className="bg-primary px-8 text-white hover:bg-primary/90"
            >
              Start Shopping
            </Button>
          </Link>
          {/* Show Admin Login button only if NOT logged in */}
          {mounted && !isLoggedIn && (
            <Link href="/admin-login">
              <Button
                size="lg"
                variant="outline"
                className="px-8 border-orange-600 text-orange-600 hover:bg-orange-50"
              >
                <Lock className="mr-2 h-4 w-4" />
                Admin Login
              </Button>
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
