import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";

export async function GET(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    // Only allow authenticated users (e.g., admin) to access this list
    if (!user || user.email !== "alexsouthflow2@gmail.com") { // You might want a more robust role-based check here
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const subscribers = await prisma.subscriber.findMany({
      where: {
        status: "active",
      },
      select: {
        id: true,
        email: true,
      },
      orderBy: {
        email: "asc",
      },
    });

    return NextResponse.json(subscribers);
  } catch (error) {
    console.error("[SUBSCRIBERS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 