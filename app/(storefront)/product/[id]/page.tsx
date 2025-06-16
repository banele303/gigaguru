import { prisma } from "@/lib/db";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import ProductClient from "./product-client";
import FeaturedProducts from "@/app/components/storefront/FeaturedProducts";
import type { Category, ProductStatus } from "@prisma/client";
import { Product } from "@/app/lib/zodSchemas";

export interface Review {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: Date;
  user: {
    firstName: string | null;
    lastName: string | null;
    profileImage: string | null;
  };
}

export interface ProductWithReviews {
  id: string;
  name: string;
  description: string;
  price: number;
  discountPrice: number;
  isSale: boolean;
  saleEndDate: Date | null;
  images: string[];
  isFeatured: boolean;
  createdAt: Date;
  status: ProductStatus;
  category: Category;
  sku: string;
  sizes: string[];
  colors: string[];
  reviews: Review[];
  quantity: number;
}

async function getProductData(productId: string) {
  noStore();
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: "published",
      },
      select: {
        id: true,
        name: true,
        description: true,
        status: true,
        price: true,
        discountPrice: true,
        isSale: true,
        saleEndDate: true,
        sku: true,
        images: true,
        category: true,
        isFeatured: true,
        quantity: true,
        sizes: true,
        colors: true,
        brand: true,
        material: true,
        createdAt: true,
        updatedAt: true,
        reviews: {
          select: {
            id: true,
            rating: true,
            comment: true,
            createdAt: true,
            user: {
              select: {
                firstName: true,
                lastName: true,
                profileImage: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });

    if (!product) {
      notFound();
    }

    const typedProduct = {
      ...product,
      sizes: product.sizes || [],
      colors: product.colors || [],
      discountPrice: product.discountPrice ?? 0,
      isSale: product.isSale ?? false,
    };

    const reviews = typedProduct.reviews || [];

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) /
          reviews.length
        : 0;

    return {
      product: typedProduct,
      reviews,
      averageRating,
      reviewCount: reviews.length,
    };
  } catch (error) {
    console.error("Error fetching product data:", error);
    notFound();
  }
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
      discountPrice: true,
      isSale: true,
      saleEndDate: true,
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

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { product, reviews, averageRating, reviewCount } = await getProductData(
    params.id
  );
  const featuredProducts = await getFeaturedProducts();

  return (
    <>
      <ProductClient
        product={product}
        reviews={reviews}
        averageRating={averageRating}
        reviewCount={reviewCount}
      />
      <div className="mt-16">
        <FeaturedProducts products={featuredProducts} />
      </div>
    </>
  );
}
