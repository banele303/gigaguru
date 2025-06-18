"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { ProductCard } from "@/app/components/storefront/ProductCard";
import { LoadingProductCard } from "@/app/components/storefront/LoadingProductCard";
import { productSchema } from "@/app/lib/zodSchemas";
import { z } from "zod";

type Product = z.infer<typeof productSchema> & {
  id: string;
  views: number;
  createdAt: Date;
  updatedAt: Date;
};

function ProductGrid({ products }: { products: Product[] }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {products.map((product) => (
        <ProductCard key={product.id} item={product} />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      <LoadingProductCard />
      <LoadingProductCard />
      <LoadingProductCard />
    </div>
  );
}

import { FilterSidebar } from "@/app/components/storefront/FilterSidebar";

function ProductsPageContent() {
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Record<string, string>>(() => {
    const params = new URLSearchParams(searchParams.toString());
    const initialFilter: Record<string, string> = {};
    
    // Only include valid filter parameters
    if (params.has('category')) initialFilter.category = params.get('category')!;
    if (params.has('brand')) initialFilter.brand = params.get('brand')!;
    if (params.has('minPrice')) initialFilter.minPrice = params.get('minPrice')!;
    if (params.has('maxPrice')) initialFilter.maxPrice = params.get('maxPrice')!;
    
    return initialFilter;
  });

  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);
      const query = new URLSearchParams(filter).toString();
      const res = await fetch(`/api/products?${query}`);
      const data = await res.json();
      setProducts(data.products || []);
      setLoading(false);
    };

    fetchProducts();
  }, [filter]);

  return (
    <div className="flex">
      <FilterSidebar setFilter={setFilter} />
      <main className="flex-1">
        <div className="p-8">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-10">
            All Products
          </h1>
          {loading ? (
            <LoadingState />
          ) : products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <div className="flex justify-center items-center h-64">
              <p className="text-xl text-gray-500">
                No products found for this category.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <ProductsPageContent />
    </Suspense>
  );
}