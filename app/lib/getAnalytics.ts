import { db as prisma } from "@/lib/db";

export async function getAnalyticsData(startDate?: Date, endDate?: Date) {
  const whereClause = {
    ...(startDate && endDate ? { createdAt: { gte: startDate, lte: endDate } } : {}),
  };

  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          product: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalOrders = orders.length;

  const dailyRevenue = orders.reduce((acc, order) => {
    const date = order.createdAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { revenue: 0, orders: 0 };
    }
    acc[date].revenue += order.amount;
    acc[date].orders += 1;
    return acc;
  }, {} as Record<string, { revenue: number; orders: number }>);

  const revenueData = Object.entries(dailyRevenue).map(([date, data]) => ({
    date,
    revenue: data.revenue,
    orders: data.orders,
    averageOrderValue: data.orders > 0 ? data.revenue / data.orders : 0,
  }));

  const totalUsers = await prisma.user.count();
  const totalProducts = await prisma.product.count();
  const totalProductViews = await prisma.productView.count({
    where: {
      viewedAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    },
  });

  const conversionRate = totalOrders > 0 ? (totalOrders / totalProductViews) * 100 : 0;

  const userActivity = [
    { name: 'Total Users', value: totalUsers },
    { name: 'Total Orders', value: totalOrders },
    { name: 'Product Views', value: totalProductViews },
    { name: 'Conversion Rate', value: `${conversionRate.toFixed(2)}%` },
  ];

  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          ...(startDate && { gte: startDate }),
          ...(endDate && { lte: endDate }),
        },
      },
    },
    select: { productId: true, quantity: true },
  });

  const productPurchases = orderItems.reduce((acc, item) => {
    if (item.productId) {
      acc[item.productId] = (acc[item.productId] || 0) + item.quantity;
    }
    return acc;
  }, {} as Record<string, number>);

  const productViewsData = await prisma.productView.findMany({
    where: {
      viewedAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    },
    select: { productId: true },
  });

  const productViews = productViewsData.reduce((acc, view) => {
    acc[view.productId] = (acc[view.productId] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const productIds = [
    ...new Set([...Object.keys(productPurchases), ...Object.keys(productViews)]),
  ];

  let topProducts: { name: string; views: number; purchases: number }[] = [];

  if (productIds.length > 0) {
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
      },
      select: { id: true, name: true },
    });

    const productMap = new Map(products.map(p => [p.id, p.name]));

    const productPerformance = productIds.map(id => ({
      name: productMap.get(id) || 'Unknown Product',
      views: productViews[id] || 0,
      purchases: productPurchases[id] || 0,
    }));

    topProducts = productPerformance
      .sort((a, b) => {
        if (b.purchases !== a.purchases) {
          return b.purchases - a.purchases;
        }
        return b.views - a.views;
      })
      .slice(0, 10);
  }

  // Fetch data for page views
  const productViewsForPageStats = await prisma.productView.findMany({
    where: {
      viewedAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    },
    select: {
      viewedAt: true,
      userId: true,
    },
  });

  const pageViewsByDate = productViewsForPageStats.reduce((acc, view) => {
    const date = view.viewedAt.toISOString().split('T')[0];
    if (!acc[date]) {
      acc[date] = { date, views: 0, uniqueVisitors: new Set<string>() };
    }
    acc[date].views += 1;
    if (view.userId) {
      acc[date].uniqueVisitors.add(view.userId);
    }
    return acc;
  }, {} as Record<string, { date: string; views: number; uniqueVisitors: Set<string> }>);

  const pageViews = Object.values(pageViewsByDate).map(item => ({
    date: item.date,
    views: item.views,
    uniqueVisitors: item.uniqueVisitors.size,
  }));

  // Fetch data for device stats
  const deviceViews = await prisma.productView.findMany({
    where: {
      device: { not: null },
      viewedAt: {
        ...(startDate && { gte: startDate }),
        ...(endDate && { lte: endDate }),
      },
    },
    select: {
      device: true,
      userId: true,
    },
  });

  const deviceUsers = deviceViews.reduce((acc, view) => {
    if (view.device && view.userId) {
      if (!acc[view.device]) {
        acc[view.device] = new Set<string>();
      }
      acc[view.device].add(view.userId);
    }
    return acc;
  }, {} as Record<string, Set<string>>);

  const deviceStats = Object.entries(deviceUsers).map(([device, users]) => ({
    device,
    users: users.size,
  }));

  // Fetch data for funnel analysis
  const viewedProductUsers = (await prisma.productView.findMany({
    where: {
      viewedAt: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) },
      userId: { not: null },
    },
    distinct: ['userId'],
    select: { userId: true },
  })).length;

  const addedToCartUsers = (await prisma.analytics.findMany({
    where: {
      type: 'cart_add',
      date: { ...(startDate && { gte: startDate }), ...(endDate && { lte: endDate }) },
      userId: { not: null },
    },
    distinct: ['userId'],
    select: { userId: true },
  })).length;

  const purchasedUsers = (await prisma.order.findMany({
    where: whereClause,
    distinct: ['userId'],
    select: { userId: true },
  })).length;

  const funnelData = [
    {
      step: 'Viewed Product',
      users: viewedProductUsers,
      dropoff: viewedProductUsers > 0 ? parseFloat((((viewedProductUsers - addedToCartUsers) / viewedProductUsers) * 100).toFixed(2)) : 0,
    },
    {
      step: 'Added to Cart',
      users: addedToCartUsers,
      dropoff: addedToCartUsers > 0 ? parseFloat((((addedToCartUsers - purchasedUsers) / addedToCartUsers) * 100).toFixed(2)) : 0,
    },
    { step: 'Purchased', users: purchasedUsers, dropoff: 0 },
  ];

  return {
    totalRevenue,
    totalOrders,
    totalProducts,
    revenueData,
    userActivity,
    topProducts,
    pageViews,
    userDemographics: [], // No country data available in the User model
    deviceStats,
    funnelData,
  };
}
