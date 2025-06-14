import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();
    const body = await req.json();
    const { items, total } = body;

    // Create cart abandonment record
    const cartAbandonment = await prisma.cartAbandonment.create({
      data: {
        userId: user?.id,
        items,
        total,
      },
    });

    return NextResponse.json({ success: true, cartAbandonment });
  } catch (error) {
    console.error("Error tracking cart abandonment:", error);
    return NextResponse.json(
      { error: "Failed to track cart abandonment" },
      { status: 500 }
    );
  }
} 