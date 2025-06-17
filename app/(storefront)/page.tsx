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

async function getFeaturedProducts({ page = 1 }: { page?: number }): Promise<{ products: Product[], totalPages: number }> {
  noStore();
  const pageSize = 8;
  const skip = (page - 1) * pageSize;

  let whereClause: any = {
    isFeatured: true,
    status: "published",
  };

  let totalProducts = await prisma.product.count({ where: whereClause });

  if (totalProducts === 0) {
    whereClause = {
      status: "published",
    };
    totalProducts = await prisma.product.count({ where: whereClause });
  }

  const products = await prisma.product.findMany({
    where: whereClause,
    orderBy: {
      createdAt: "desc",
    },
    skip: skip,
    take: pageSize,
  });

  const totalPages = Math.ceil(totalProducts / pageSize);

  return { products, totalPages };
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

export default async function IndexPage({ searchParams }: { searchParams?: { page?: string } }) {
  const currentPage = Number(searchParams?.page) || 1;

  const [banners, { products, totalPages }] = await Promise.all([
    getBannerData(),
    getFeaturedProducts({ page: currentPage }),
  ]);

  return (
    <Suspense fallback={<LoadingState />}>
      <div>
        <Hero data={banners} />
        <HomeCategories />
        <FeaturedProducts products={products} totalPages={totalPages} currentPage={currentPage} />
      </div>
    </Suspense>
  );
}
