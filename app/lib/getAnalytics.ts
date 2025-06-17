import { db as prisma } from "@/lib/db";
import { startOfDay, endOfDay, subDays } from "date-fns";

export async function getAnalytics(startDate?: Date, endDate?: Date) {
  const defaultEndDate = new Date();
  const defaultStartDate = subDays(defaultEndDate, 30);

  const finalStartDate = startDate ? startOfDay(startDate) : defaultStartDate;
  const finalEndDate = endDate ? endOfDay(endDate) : defaultEndDate;

  const totalRevenueResult = await prisma.order.aggregate({
    where: {
      createdAt: { gte: finalStartDate, lte: finalEndDate },
      status: "completed",
    },
    _sum: { amount: true },
  });

  const totalOrders = await prisma.order.count({
    where: {
      createdAt: { gte: finalStartDate, lte: finalEndDate },
      status: "completed",
    },
  });

  const totalCustomers = await prisma.user.count({
    where: {
      createdAt: { gte: finalStartDate, lte: finalEndDate },
    },
  });

  const totalProducts = await prisma.product.count();

  const salesOverTime = await prisma.order.findMany({
    where: {
      createdAt: { gte: finalStartDate, lte: finalEndDate },
      status: "completed",
    },
    select: { createdAt: true, amount: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyRevenue = salesOverTime.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split("T")[0];
    if (!acc[date]) {
      acc[date] = 0;
    }
    acc[date] += order.amount;
    return acc;
  }, {} as Record<string, number>);

  const formattedSalesOverTime = Object.entries(dailyRevenue).map(([date, revenue]) => ({
    date,
    revenue,
  }));

  const topSellingProductsResult = await prisma.orderItem.groupBy({
    by: ["productId"],
    _sum: { quantity: true },
    orderBy: { _sum: { quantity: "desc" } },
    take: 5,
  });

  const productIds = topSellingProductsResult.map((p) => p.productId);
  const products = await prisma.product.findMany({
    where: { id: { in: productIds } },
    select: { id: true, name: true },
  });
  const productMap = new Map(products.map((p) => [p.id, p.name]));
  const topSellingProducts = topSellingProductsResult.map((p) => ({
    name: productMap.get(p.productId) || "Unknown Product",
    totalQuantity: p._sum.quantity || 0,
  }));

  const categoryDistributionResult = await prisma.product.groupBy({
    by: ["category"],
    _count: { _all: true },
  });

  const categoryDistribution = categoryDistributionResult.map((c) => ({
    name: c.category,
    value: c._count._all,
  }));

  const topCustomersResult = await prisma.order.groupBy({
    by: ["userId"],
    _sum: { amount: true },
    orderBy: { _sum: { amount: "desc" } },
    take: 5,
  });

  const userIds = topCustomersResult.map((c) => c.userId).filter((id): id is string => id !== null);
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, firstName: true, lastName: true },
  });
  const userMap = new Map(users.map((u) => [u.id, `${u.firstName} ${u.lastName}`]));
  const topCustomers = topCustomersResult.map((c) => ({
    name: c.userId ? userMap.get(c.userId) || "Unknown User" : "Unknown User",
    totalSpent: c._sum.amount || 0,
  }));

  const totalRevenue = totalRevenueResult._sum.amount || 0;
  const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

  return {
    totalRevenue,
    totalOrders,
    totalCustomers,
    totalProducts,
    salesOverTime: formattedSalesOverTime,
    topSellingProducts,
    categoryDistribution,
    topCustomers,
    averageOrderValue,
    startDate: finalStartDate,
    endDate: finalEndDate,
  };
}
