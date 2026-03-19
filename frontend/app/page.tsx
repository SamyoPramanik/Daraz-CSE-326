import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Zap, TrendingUp, ChevronRight } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { fetchProducts, fetchTrendingProducts } from "@/lib/api";


export default async function Home() {
  // Fetch flash sale and trending products
  let flashSales = [];
  let trendingProducts = [];

  try {
    const [flashSaleRes, trendingRes] = await Promise.all([
      fetchProducts({ flash_sale: "true", limit: "5" }),
      fetchTrendingProducts()
    ]);
    flashSales = flashSaleRes.data || [];
    trendingProducts = trendingRes.data || [];
  } catch (error) {
    console.error("Failed to fetch products:", error);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Hero Section */}
      <section className="mb-12 rounded-2xl bg-orange-100 p-8 text-center md:text-left">
        <div className="max-w-2xl">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl">
            Welcome to Daraz
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

        {flashSales.length === 0 ? (
          <div className="p-10 text-center text-gray-400 border rounded-lg bg-white/50">
            No flash sales available right now.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {flashSales.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.discount_price}
                imageUrl={product.image_url}
                rating={parseFloat(product.rating || "0")}
              />
            ))}
          </div>
        )}
      </section>

      {/* Trending Products Preview */}
      <section>
        <div className="mb-6 flex items-center gap-2">
          <TrendingUp className="h-6 w-6 text-primary" />
          <h2 className="text-2xl font-bold text-gray-900">Trending Now</h2>
        </div>

        {trendingProducts.length === 0 ? (
          <div className="p-10 text-center text-gray-400 border rounded-lg bg-white/50">
            No trending products found.
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {trendingProducts.map((product: any) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                price={product.price}
                originalPrice={product.discount_price}
                imageUrl={product.image_url}
                rating={parseFloat(product.rating || "0")}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
