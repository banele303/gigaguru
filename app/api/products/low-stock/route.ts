import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { db } from "@/lib/db";
import { Product } from "@/app/lib/zodSchemas";

export async function GET(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const lowStockProducts = await db.product.findMany({
      where: {
        userId: user.id,
        stockQuantity: {
          lte: 10, // Products with stock less than or equal to 10
        },
      },
      orderBy: {
        stockQuantity: "asc",
      },
    });

    const formattedProducts = lowStockProducts.map((product: Product) => ({
      ...product,
      lastUpdated: product.updatedAt.toISOString()
    }));

    return NextResponse.json(formattedProducts);
  } catch (error) {
    console.error("[LOW_STOCK_PRODUCTS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 