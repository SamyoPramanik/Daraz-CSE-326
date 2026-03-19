import { notFound } from "next/navigation";
import { fetchProduct } from "@/lib/api";
import ProductActions from "@/components/ProductActions";
import { Star, Truck, ShieldCheck } from "lucide-react";

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const product = await fetchProduct(id);

    if (!product) notFound();

    const displayPrice = product.discount_price ?? product.price;
    const hasDiscount = product.discount_price && product.price > product.discount_price;

    return (
        <div className="container mx-auto px-4 py-8 max-w-6xl">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8">
                <div className="flex flex-col md:flex-row gap-8 lg:gap-12">

                    {/* Product Image */}
                    <div className="md:w-5/12 lg:w-1/2">
                        <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
                            {product.image_url ? (
                                <img
                                    src={product.image_url}
                                    alt={product.name}
                                    className="object-cover w-full h-full"
                                />
                            ) : (
                                <span className="text-gray-400 font-medium">No Image</span>
                            )}
                        </div>
                    </div>

                    {/* Product Info */}
                    <div className="md:w-7/12 lg:w-1/2 flex flex-col">
                        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{product.name}</h1>

                        {/* Rating */}
                        <div className="flex items-center gap-4 mb-4">
                            <div className="flex items-center text-yellow-500">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="ml-1 font-bold text-gray-900">
                                    {product.rating?.avg ? Number(product.rating.avg).toFixed(1) : "0.0"}
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
            {product.reviews && product.reviews.length > 0 && (
                <div className="mt-8 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="p-6 md:p-8">
                        <h2 className="text-xl font-bold mb-6">
                            Customer Reviews
                            <span className="ml-2 text-sm font-normal text-gray-500">
                                ({product.reviews.length})
                            </span>
                        </h2>
                        <div className="space-y-6">
                            {product.reviews.map((review: any) => (
                                <div key={review.id} className="border-b pb-4 last:border-0 last:pb-0">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center font-bold text-primary text-sm">
                                            {review.user_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm">{review.user_name}</div>
                                            <div className="flex items-center gap-2">
                                                <div className="flex text-yellow-500">
                                                    {Array.from({ length: 5 }).map((_, i) => (
                                                        <Star
                                                            key={i}
                                                            className={`w-3 h-3 ${i < review.rating ? "fill-current" : "text-gray-200 fill-gray-200"}`}
                                                        />
                                                    ))}
                                                </div>
                                                <span className="text-xs text-gray-400">
                                                    {new Date(review.created_at).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    {review.review && (
                                        <p className="text-gray-700 text-sm pl-10">{review.review}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
