import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import { Refund } from "@/app/lib/zodSchemas";

export async function GET(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const refunds = await prisma.refundRequest.findMany({
      where: {
        order: {
          userId: user.id
        }
      },
      include: {
        order: {
          select: {
            amount: true,
            userId: true
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    // Transform the data to include the amount from the order
    const transformedRefunds = refunds.map((refund) => ({
      ...refund,
      userId: refund.order.userId,
      amount: refund.order.amount,
    })) as Refund[];

    return NextResponse.json(transformedRefunds);
  } catch (error) {
    console.error("[REFUNDS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 