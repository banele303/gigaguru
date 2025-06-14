import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";

export async function GET() {
  noStore();
  try {
    const data = await prisma.order.findMany({
      select: {
        amount: true,
        id: true,
        user: {
          select: {
            firstName: true,
            profileImage: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 7,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error fetching recent sales:", error);
    return NextResponse.json({ error: "Failed to fetch recent sales" }, { status: 500 });
  }
} 