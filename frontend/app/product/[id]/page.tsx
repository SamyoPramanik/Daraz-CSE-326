import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/api";
import ProductActions from "@/components/ProductActions";
import ProductReviews from "@/components/ProductReviews";
import { Star, Truck, ShieldCheck } from "lucide-react";

interface ProductReview {
  id: number;
  user_name: string;
  rating: number;
  review: string | null;
  created_at: string;
}

interface ProductDetail {
  id: string;
  name: string;
  image_url: string;
  price: number;
  discount_price: number | null;
  stock: number;
  description?: string;
  flash_sale?: boolean;
  total_sold?: number;
  rating?: {
    avg: number;
    total_reviews: number;
  };
  reviews?: ProductReview[];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const product = (await fetchProduct(id)) as ProductDetail | null;

  if (!product) {
    return {
      title: "Product | Daraz",
      description: "Product not found",
    };
  }

  return {
    title: `${product.name} | Daraz`,
    description: product.description || product.name,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = (await fetchProduct(id)) as ProductDetail | null;

  if (!product) notFound();

  const displayPrice = product.discount_price ?? product.price;
  const hasDiscount =
    product.discount_price && product.price > product.discount_price;

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-8 lg:gap-12">
          {/* Product Image */}
          <div className="md:w-5/12 lg:w-1/2">
            <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
              {product.image_url ? (
                <Image
                  src={product.image_url}
                  alt={product.name}
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <span className="text-gray-400 font-medium">No Image</span>
              )}
            </div>
          </div>

          {/* Product Info */}
          <div className="md:w-7/12 lg:w-1/2 flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-4 mb-4">
              <div className="flex items-center text-yellow-500">
                <Star className="w-5 h-5 fill-current" />
                <span className="ml-1 font-bold text-gray-900">
                  {product.rating?.avg
                    ? Number(product.rating.avg).toFixed(1)
                    : "0.0"}
                </span>
                <span className="ml-1 text-sm text-primary">
                  ({product.rating?.total_reviews ?? 0} Reviews)
                </span>
              </div>
              {product.flash_sale && (
                <span className="px-2 py-0.5 bg-red-100 text-red-600 text-xs font-bold rounded uppercase tracking-wide">
                  Flash Sale
                </span>
              )}
            </div>

            {/* Stock and Sales Info */}
            <div className="flex flex-col gap-2 mb-4 text-sm">
              <div className="text-gray-700">
                {product.total_sold !== undefined && (
                  <span className="font-medium">
                    {product.total_sold === 0
                      ? "No sales yet"
                      : `${product.total_sold} sold`}
                  </span>
                )}
              </div>
              {product.stock === 0 ? (
                <span className="px-3 py-2 bg-red-100 text-red-700 font-semibold rounded text-center w-fit">
                  Out of Stock
                </span>
              ) : (
                <span className="text-green-600 font-medium">
                  {product.stock} items available
                </span>
              )}
            </div>

            {/* Price */}
            <div className="border-y py-4 mb-6 bg-gray-50/50 -mx-6 px-6 md:mx-0 md:px-4 md:rounded-lg">
              <div className="flex items-end gap-3 mb-1">
                <span className="text-3xl font-bold text-primary">
                  ৳ {Number(displayPrice).toLocaleString()}
                </span>
                {hasDiscount && (
                  <span className="text-lg text-gray-400 line-through mb-1">
                    ৳ {Number(product.price).toLocaleString()}
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            {product.description && (
              <p className="text-gray-600 leading-relaxed line-clamp-4 mb-6">
                {product.description}
              </p>
            )}

            {/* Features */}
            <div className="grid grid-cols-2 gap-3 text-sm mb-8">
              <div className="flex items-center gap-2 text-gray-700">
                <Truck className="w-5 h-5 text-gray-400" />
                <span>Standard Delivery (3-5 days)</span>
              </div>
              <div className="flex items-center gap-2 text-gray-700">
                <ShieldCheck className="w-5 h-5 text-gray-400" />
                <span>100% Authentic Guarantee</span>
              </div>
            </div>

            {/* Add to Cart / Buy Now — client component */}
            <ProductActions productId={id} stock={product.stock ?? 99} />
          </div>
        </div>
      </div>

      {/* Reviews Section */}
      <ProductReviews productId={id} />
    </div>
  );
}
