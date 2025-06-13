import prisma from "@/app/lib/db";
import { Order } from "@/app/lib/zodSchemas";

export async function getData() {
  try {
    const [products, users, orders] = await Promise.all([
      prisma.product.findMany(),
      prisma.user.findMany(),
      prisma.order.findMany({
        include: {
          orderItems: true,
        },
      }),
    ]);

    return {
      products,
      user: users,
      order: orders,
    };
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    return {
      products: [],
      user: [],
      order: [],
    };
  }
} 