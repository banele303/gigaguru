import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import { Product } from "@/app/lib/zodSchemas";

export async function GET(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lowStockProducts = await prisma.product.findMany({
      where: {
        userId: user.id,
        quantity: {
          lte: 10, // Products with stock less than or equal to 10
        },
      },
      orderBy: {
        quantity: "asc",
      },
    });

    const formattedProducts = lowStockProducts.map((product) => ({
      ...product,
      brand: product.brand ?? undefined,
      material: product.material ?? undefined,
      lastUpdated: product.updatedAt.toISOString()
    })) as Product[];

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("[LOW_STOCK_PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 