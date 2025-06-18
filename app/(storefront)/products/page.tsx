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
  const [filter, setFilter] = useState<Record<string, string>>({});

  // Update filter state when URL params change
  useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    const newFilter: Record<string, string> = {};
    
    // Include all valid filter parameters
    if (params.has('category')) newFilter.category = params.get('category')!;
    if (params.has('brand')) newFilter.brand = params.get('brand')!;
    if (params.has('minPrice')) newFilter.minPrice = params.get('minPrice')!;
    if (params.has('maxPrice')) newFilter.maxPrice = params.get('maxPrice')!;
    if (params.has('material')) newFilter.material = params.get('material')!;
    if (params.has('size')) newFilter.size = params.get('size')!;
    if (params.has('color')) newFilter.color = params.get('color')!;
    
    setFilter(newFilter);
  }, [searchParams]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const query = new URLSearchParams(filter).toString();
        console.log('Fetching products with query:', query);
        const res = await fetch(`/api/products?${query}`);
        const data = await res.json();
        console.log('Products data:', data);
        setProducts(data.products || []);
      } catch (error) {
        console.error('Error fetching products:', error);
      } finally {
        setLoading(false);
      }
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