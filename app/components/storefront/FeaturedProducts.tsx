import { Suspense } from "react";
import { FeaturedProductsClient, LoadingRows } from "./FeaturedProductsClient";
import { Product } from "@/app/lib/zodSchemas";

// This is now a presentational component that just receives data
export default function FeaturedProducts({ products }: { products: Product[] }) {
  return (
    <Suspense fallback={<LoadingRows />}>
      <FeaturedProductsClient products={products} />
    </Suspense>
  );
}
