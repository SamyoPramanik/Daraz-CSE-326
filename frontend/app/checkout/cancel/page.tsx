"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { XCircle, Package, ArrowRight } from "lucide-react";

export default function CheckoutCancelPage() {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md mx-auto">
        {/* Cancel/fail icon */}
        <div className="mb-8 inline-flex items-center justify-center w-24 h-24 rounded-full bg-red-100">
          <XCircle className="w-14 h-14 text-red-500" />
        </div>

        <h1 className="text-3xl font-bold text-gray-900 mb-3">
          Payment Not Completed
        </h1>
        <p className="text-gray-500 mb-2 text-lg">
          Your payment was not completed. No charges have been made.
        </p>
        <p className="text-sm text-gray-400 mt-2">
          If you cancelled by mistake, you can place a new order from your cart.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mt-8">
          <Link href="/profile/orders">
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
