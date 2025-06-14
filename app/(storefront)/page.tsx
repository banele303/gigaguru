import { Suspense } from "react";
import { HomeCategories } from "../components/storefront/HomeCategories";
import FeaturedProducts from "../components/storefront/FeaturedProducts";
import { Hero, BannerData } from "../components/storefront/Hero";
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { Product } from "@/app/lib/zodSchemas";

async function getBannerData(): Promise<BannerData[]> {
  noStore();
  const data = await prisma.banner.findMany({
    select: {
      id: true,
      title: true,
      imageString: true,
    },
    orderBy: {
      createdAt: "desc",
    },
  });
  return data;
}

async function getFeaturedProducts(): Promise<Product[]> {
  noStore();
  const data = await prisma.product.findMany({
    where: {
      isFeatured: true,
      status: "published",
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
  return data;
}

function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="h-[600px] bg-gray-200 mb-8" />
      <div className="h-32 bg-gray-200 mb-8" />
      <div className="h-96 bg-gray-200" />
    </div>
  );
}

export default async function IndexPage() {
  const [banners, products] = await Promise.all([
    getBannerData(),
    getFeaturedProducts(),
  ]);

  return (
    <Suspense fallback={<LoadingState />}>
      <div>
        <Hero data={banners} />
        <HomeCategories />
        <FeaturedProducts products={products} />
      </div>
    </Suspense>
  );
}
