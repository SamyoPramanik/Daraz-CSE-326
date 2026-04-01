"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { CheckCircle2, Package, ArrowRight } from "lucide-react";

function SuccessContent() {
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Animated success icon */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-green-100 animate-[bounceIn_0.6s_ease-out]">
          <CheckCircle2 className="w-14 h-14 text-green-600" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Successful!
        </h1>
        <p className="text-gray-500 mb-2 text-lg">
          Thank you for your purchase. Your order has been confirmed.
        </p>

        {orderId && (
          <div className="my-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
            <p className="text-sm text-gray-500 mb-1">Order ID</p>
            <p className="font-mono text-sm text-gray-800 font-semibold break-all">
              {orderId}
            </p>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href={orderId ? `/profile/orders` : "/profile/orders"}>
            <Button className="bg-primary hover:bg-primary/90 text-white font-semibold h-12 px-6 gap-2">
              <Package className="w-4 h-4" />
              View My Orders
            </Button>
          </Link>
          <Link href="/search">
            <Button
              variant="outline"
              className="h-12 px-6 gap-2 border-gray-200"
            >
              Continue Shopping
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function CheckoutSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[70vh] flex items-center justify-center">
          <p className="text-gray-500">Loading...</p>
        </div>
      }
    >
      <SuccessContent />
    </Suspense>
  );
}
