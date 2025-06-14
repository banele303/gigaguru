"use client";

import { ProductCard } from "./ProductCard";
import { Product } from "@/app/lib/zodSchemas";

// Client component that receives data via props
export function FeaturedProductsClient({ products }: { products: Product[] }) {
  return (
    <section className="py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Featured Collection
          </h2>
          <p className="mt-4 text-xl text-gray-500">
            Discover our handpicked selection of premium footwear
          </p>
        </div>
        <div className="mt-10">
          {products.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {products.map((item) => (
                <ProductCard key={item.id} item={item} />
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-lg text-gray-500">No products to display at the moment.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

// Loading skeleton for product cards
export function LoadingRows() {
  return (
    <div className="mt-10 grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
      {[1, 2, 3].map((i) => (
        <div key={i} className="border rounded-md p-4 animate-pulse">
          <div className="h-40 bg-gray-200 rounded-md mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      ))}
    </div>
  );
}
