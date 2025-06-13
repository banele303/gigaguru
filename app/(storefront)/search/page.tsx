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
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} item={product} />
      ))}
    </div>
  );
}

function LoadingState() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      <LoadingProductCard />
      <LoadingProductCard />
      <LoadingProductCard />
    </div>
  );
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("query");
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      const fetchProducts = async () => {
        setLoading(true);
        const res = await fetch(`/api/search?query=${query}`);
        const data = await res.json();
        setProducts(data);
        setLoading(false);
      };

      fetchProducts();
    } else {
      setProducts([]);
      setLoading(false);
    }
  }, [query]);

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-bold tracking-tight text-gray-900">
        Search Results for: &quot;{query}&quot;
      </h1>
      <div className="mt-8">
        {loading ? (
          <LoadingState />
        ) : (
          products.length > 0 ? (
            <ProductGrid products={products} />
          ) : (
            <p>No products found.</p>
          )
        )}
      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <SearchPageContent />
    </Suspense>
  );
}