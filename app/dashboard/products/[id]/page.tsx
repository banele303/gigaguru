import { EditForm } from "@/app/components/dashboard/EditForm";
import prisma from "@/app/lib/db";
import { notFound } from "next/navigation";
import { unstable_noStore as noStore } from "next/cache";
import { ProductStatus, Category } from "@/app/lib/prisma-types";

export const dynamic = "force-dynamic";

async function getData(productId: string) {
  const data = await prisma.product.findUnique({
    where: {
      id: productId,
    },
    select: {
      id: true,
      name: true,
      description: true,
      status: true,
      price: true,
      images: true,
      category: true,
      isFeatured: true,
      sizes: true,
      colors: true,
      sku: true,
      quantity: true,
      reviews: {
        select: {
          id: true,
          rating: true,
          comment: true,
          createdAt: true,
          productId: true,
          userId: true,
          updatedAt: true,
          user: {
            select: {
              firstName: true,
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

  if (!data) {
    return notFound();
  }

  // Transform the data to use our custom enums
  return {
    ...data,
    status: data.status as ProductStatus,
    category: data.category as Category,
  };
}

export default async function EditRoute({
  params,
}: {
  params: { id: string };
}) {
  const data = await getData(params.id);
  return <EditForm data={data} />;
}
