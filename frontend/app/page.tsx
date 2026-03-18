import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Zap, TrendingUp, ChevronRight } from "lucide-react";

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-2xl bg-orange-100 p-8 text-center md:text-left">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Welcome to DarazClone
          </h1>
          <p className="mb-6 text-lg text-gray-700">
            Discover the best deals on millions of products spanning electronics, fashion, home goods, and more.
          </p>
          <Link href="/search">
            <Button size="lg" className="bg-primary px-8 text-white hover:bg-primary/90">
              Start Shopping
            </Button>
          </Link>
        </div>
      </section>

      {/* Flash Sale Preview */}
      <section className="mb-12">
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-6 w-6 text-primary" />
            <h2 className="text-2xl font-bold text-gray-900">Flash Sales</h2>
          </div>
          <Link href="/search?flash_sale=true">
            <Button variant="ghost" className="text-primary hover:text-primary/90">
              View All <ChevronRight className="ml-1 h-4 w-4" />
            </Button>
          </Link>
        </div>

        {/* Placeholder Grid */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="group cursor-pointer overflow-hidden border-gray-100 bg-white transition-all hover:shadow-md">
              <div className="aspect-square bg-gray-100">
                {/* Image Placeholder */}
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                  Image
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-900">Product Name Placeholder {i}</h3>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-primary">৳ 999</span>
                  <span className="text-xs text-gray-500 line-through">৳ 1299</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Trending Categories Preview */}
      <section>
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {[1, 2, 3, 4, 5].map((i) => (
            <Card key={i} className="group cursor-pointer overflow-hidden border-gray-100 bg-white transition-all hover:shadow-md">
              <div className="aspect-square bg-gray-100">
                <div className="flex h-full w-full items-center justify-center bg-gray-200 text-gray-400">
                  Image
                </div>
              </div>
              <CardContent className="p-4">
                <h3 className="line-clamp-2 text-sm font-medium text-gray-900">Trending Item {i}</h3>
                <div className="mt-2">
                  <span className="text-lg font-bold text-primary">৳ 1499</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
