import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const body = await req.json();
    const { type, productId, source, device } = body;

    // Create analytics record
    const analytics = await prisma.analytics.create({
      data: {
        type,
        userId: user?.id,
        productId,
        metadata: {
          source,
          device,
          timestamp: new Date().toISOString(),
        },
      },
    });

    // If it's a product view, also update the product views
    if (type === "page_view" && productId) {
      await Promise.all([
        prisma.productView.create({
          data: {
            productId,
            userId: user?.id,
            source,
            device,
          },
        }),
        prisma.product.update({
          where: { id: productId },
          data: {
            views: {
              increment: 1,
            },
          },
        }),
      ]);
    }

    return NextResponse.json({ success: true, analytics });
  } catch (error) {
    console.error("Error tracking analytics:", error);
    return NextResponse.json(
      { error: "Failed to track analytics" },
      { status: 500 }
    );
  }
} 