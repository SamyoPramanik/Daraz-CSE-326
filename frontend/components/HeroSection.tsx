"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuthStore } from "@/lib/authStore";

export default function HeroSection() {
  const router = useRouter();
  const { user, isLoggedIn, hasInitialized, initializeFromStorage } = useAuthStore();

  // Initialize auth on mount
  useEffect(() => {
    if (!hasInitialized) {
      initializeFromStorage();
    }
  }, [hasInitialized, initializeFromStorage]);

  // Redirect admins to admin dashboard
  useEffect(() => {
    if (hasInitialized && isLoggedIn && user?.is_admin) {
      router.push("/admin");
    }
  }, [hasInitialized, isLoggedIn, user?.is_admin, router]);

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
        </div>
      </div>
    </section>
  );
}
