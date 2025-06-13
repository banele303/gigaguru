import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import ProductClient, { ProductWithReviews } from "./product-client";
import FeaturedProducts from "@/app/components/storefront/FeaturedProducts";

async function getProductData(productId: string) {
  noStore();
  try {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: "published",
      },
      include: {
        reviews: {
          include: {
            user: true,
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

    // Ensure we have sizes and colors arrays even if they're empty
    const typedProduct = {
      ...product,
      sizes: product.sizes || [],
      colors: product.colors || []
    } as unknown as ProductWithReviews;
    
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

export default async function ProductPage({
  params,
}: {
  params: { id: string };
}) {
  const { product, reviews, averageRating, reviewCount } = await getProductData(
    params.id
  );

  return (
    <>
      <ProductClient
        product={product}
        reviews={reviews}
        averageRating={averageRating}
        reviewCount={reviewCount}
      />
      <div className="mt-16">
        <FeaturedProducts />
      </div>
    </>
  );
}
