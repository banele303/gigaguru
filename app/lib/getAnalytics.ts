import { db as prisma } from "@/lib/db";

export async function getAnalytics() {
  const orders = await prisma.order.findMany({
    where: {
      status: "completed",
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalSales = orders.length;

  const totalProducts = await prisma.product.count();

  return {
    totalRevenue,
    totalSales,
    totalProducts,
  };
}
