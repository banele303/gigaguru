import { Suspense } from "react";
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { FeaturedProductsClient, LoadingRows } from "./FeaturedProductsClient";
import { Product } from "@/app/lib/zodSchemas";

async function getData(): Promise<Product[]> {
  noStore();
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
      status: "published"
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      price: true,
      sku: true,
      images: true,
      category: true,
      isFeatured: true,
      quantity: true,
      sizes: true,
      colors: true,
      brand: true,
      material: true,
      views: true,
      createdAt: true,
      updatedAt: true,
    },
    take: 3,
  });

  // Return the data directly since it already matches the Zod schema
  return data;
}

// Server component wrapper (default export)
export default async function FeaturedProducts() {
  const products = await getData();

  return (
    <Suspense fallback={<LoadingRows />}>
      <FeaturedProductsClient products={products} />
    </Suspense>
  );
}
