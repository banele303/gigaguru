import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { Product } from "./zodSchemas";

export async function getFeaturedProducts(currentProductId: string): Promise<Product[]> {
  noStore();
  try {
    const products = await prisma.product.findMany({
      where: {
        isFeatured: true,
        id: {
          not: currentProductId
        },
        status: "published"
      },
      take: 4,
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
      }
    });
    
    return products;
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
} 