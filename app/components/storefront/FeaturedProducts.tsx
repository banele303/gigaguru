import { Suspense } from "react";
import { FeaturedProductsClient, LoadingRows } from "./FeaturedProductsClient";
import { Product } from "@/app/lib/zodSchemas";

interface FeaturedProductsProps {
  products: Product[];
  totalPages?: number;
  currentPage?: number;
}

export default function FeaturedProducts({ products, totalPages, currentPage }: FeaturedProductsProps) {
  return (
    <Suspense fallback={<LoadingRows />}>
      <FeaturedProductsClient products={products} totalPages={totalPages} currentPage={currentPage} />
    </Suspense>
  );
}
