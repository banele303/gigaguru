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
  let featuredProducts = await prisma.product.findMany({
    where: {
      isFeatured: true,
      status: "published",
    },
    take: 3,
  });

  if (featuredProducts.length === 0) {
    featuredProducts = await prisma.product.findMany({
      where: {
        status: "published",
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });
  }

  return featuredProducts;
}

function LoadingState() {
  return (
    <div className="animate-pulse">
      <div className="h-[600px] bg-muted mb-8" />
      <div className="h-32 bg-muted mb-8" />
      <div className="h-96 bg-muted" />
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
