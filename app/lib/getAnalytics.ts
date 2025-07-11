import { db as prisma } from "@/lib/db";
import { subDays, format, startOfDay, endOfDay } from "date-fns";

// PostHog server-side analytics integration
async function getPostHogData(startDate: Date, endDate: Date) {
  const projectId = process.env.NEXT_PUBLIC_POSTHOG_PROJECT_ID;
  const personalApiKey = process.env.POSTHOG_PERSONAL_API_KEY;
  
  if (!projectId || !personalApiKey) {
    console.warn('PostHog Personal API Key not configured. Real-time analytics unavailable.');
    return null;
  }

  try {
    const baseUrl = `https://us.i.posthog.com/api/projects/${projectId}`;
    const headers = {
      'Authorization': `Bearer ${personalApiKey}`,
      'Content-Type': 'application/json',
    };

    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const dateAfter = formatDate(startDate);
    // Add one day to endDate to include today's events (PostHog uses exclusive end date)
    const dateBeforeInclusive = formatDate(new Date(endDate.getTime() + 24 * 60 * 60 * 1000));

    console.info(`PostHog API call: fetching events from ${dateAfter} to ${dateBeforeInclusive} (inclusive of today)`);

    // Fetch page views and events - remove date filtering to get all recent events first
    const eventsResponse = await fetch(
      `${baseUrl}/events/?limit=10000`,
      { headers }
    );

    if (!eventsResponse.ok) {
      console.warn(`PostHog API error: ${eventsResponse.status}`);
      return null;
    }

    const eventsData = await eventsResponse.json();
    
    console.info(`PostHog: Successfully fetched ${eventsData.results?.length || 0} total events`);
    
    // Filter events by date range on client side for more control
    const allEvents = eventsData.results || [];
    const filteredEvents = allEvents.filter((event: any) => {
      let eventDate = null;
      if (event.timestamp) {
        eventDate = new Date(event.timestamp);
      } else if (event.time) {
        eventDate = new Date(event.time);
      } else if (event.properties?.$time) {
        eventDate = new Date(event.properties.$time);
      }
      
      if (eventDate) {
        const eventDateOnly = new Date(eventDate.toDateString()); // Remove time component
        const startDateOnly = new Date(startDate.toDateString());
        const endDateOnly = new Date(endDate.toDateString());
        
        return eventDateOnly >= startDateOnly && eventDateOnly <= endDateOnly;
      }
      return false;
    });
    
    console.info(`PostHog: ${filteredEvents.length} events after date filtering (${formatDate(startDate)} to ${formatDate(endDate)})`);
    console.info(`Today's events:`, filteredEvents.filter((e: any) => {
      const eventDate = new Date(e.timestamp || e.time || e.properties?.$time);
      return formatDate(eventDate) === formatDate(new Date());
    }).length);
    
    return {
      events: filteredEvents,
    };
  } catch (error) {
    console.warn('PostHog API error:', error);
    return null;
  }
}

export async function getAnalyticsData(startDate?: Date, endDate?: Date) {
  const defaultStartDate = startDate || subDays(new Date(), 7); // Changed to 7 days for faster testing
  const defaultEndDate = endDate || new Date();
  
  console.info(`Analytics date range: ${format(defaultStartDate, 'yyyy-MM-dd')} to ${format(defaultEndDate, 'yyyy-MM-dd')}`);
  console.info(`Today is: ${format(new Date(), 'yyyy-MM-dd')}`);
  console.info(`Current time: ${new Date().toISOString()}`);
  
  const whereClause = {
    createdAt: { 
      gte: startOfDay(defaultStartDate), 
      lte: endOfDay(defaultEndDate) 
    },
  };

  // Fetch PostHog data (primary source)
  const postHogData = await getPostHogData(defaultStartDate, defaultEndDate);

  // Get orders data (still needed for revenue)
  const orders = await prisma.order.findMany({
    where: whereClause,
    include: {
      items: {
        include: {
          product: true,
        },
      },
      user: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          email: true,
        },
      },
    },
    orderBy: {
      createdAt: 'asc',
    },
  });

  const totalRevenue = orders.reduce((sum, order) => sum + order.amount, 0);
  const totalOrders = orders.length;

  // Calculate daily revenue and orders
  const dailyRevenue = orders.reduce((acc, order) => {
    const date = format(order.createdAt, 'yyyy-MM-dd');
    if (!acc[date]) {
      acc[date] = { revenue: 0, orders: 0 };
    }
    acc[date].revenue += order.amount;
    acc[date].orders += 1;
    return acc;
  }, {} as Record<string, { revenue: number; orders: number }>);

  const revenueData = Object.entries(dailyRevenue).map(([date, data]) => ({
    date,
    revenue: data.revenue / 100, // Convert cents to rands
    orders: data.orders,
    averageOrderValue: data.orders > 0 ? (data.revenue / data.orders) / 100 : 0,
  }));

  // Get basic metrics
  const totalUsers = await prisma.user.count();
  const newUsersInPeriod = await prisma.user.count({
    where: {
      createdAt: {
        gte: defaultStartDate,
        lte: defaultEndDate,
      },
    },
  });
  const totalProducts = await prisma.product.count();

  // Process PostHog data for analytics
  let totalPageViews = 0;
  let uniqueVisitors = 0;
  let topPages: Array<{ path: string; views: number; uniqueVisitors: number }> = [];
  let deviceStats: Array<{ device: string; users: number }> = [];
  let browserStats: Array<{ browser: string; users: number }> = [];
  let countryStats: Array<{ country: string; users: number }> = [];
  let referrerStats: Array<{ source: string; views: number }> = [];
  let dailyPageViews: Array<{ date: string; views: number; uniqueVisitors: number }> = [];

  let realFunnelData: any[] = [];

  if (postHogData && postHogData.events && postHogData.events.length > 0) {
    const events = postHogData.events;
    
    console.info(`PostHog data processing for date range: ${format(defaultStartDate, 'yyyy-MM-dd')} to ${format(defaultEndDate, 'yyyy-MM-dd')}`);
    interface PostHogEventSample {
      event: string;
      timestamp?: string;
      time?: string;
      properties_time?: string;
      distinct_id: string;
    }

    console.info(`PostHog events sample:`, events.slice(0, 3).map((e: any): PostHogEventSample => ({
      event: e.event,
      timestamp: e.timestamp,
      time: e.time,
      properties_time: e.properties?.$time,
      distinct_id: e.distinct_id
    })));
    
    // Separate events by type for funnel analysis
    const pageViews = events.filter((e: any) => e.event === '$pageview');
    const productViews = events.filter((e: any) => e.event === 'product_viewed');
    const addToCarts = events.filter((e: any) => e.event === 'add_to_cart');
    const checkoutStarted = events.filter((e: any) => e.event === 'checkout_started');
    const purchases = events.filter((e: any) => e.event === 'purchase_completed');

    totalPageViews = pageViews.length;
    const visitorIds = new Set(events.map((event: any) => event.distinct_id));
    uniqueVisitors = visitorIds.size;

    console.info(`PostHog real data: ${totalPageViews} page views, ${uniqueVisitors} unique visitors`);
    console.info(`PostHog funnel events: ${productViews.length} product views, ${addToCarts.length} add to cart, ${checkoutStarted.length} checkout started, ${purchases.length} purchases`);

    // Process page views by URL
    const pageViewsMap: Record<string, { views: number; uniqueVisitors: Set<string> }> = {};
    pageViews.forEach((event: any) => {
      const path = event.properties?.$current_url || event.properties?.$pathname || 'Unknown';
      const distinctId = event.distinct_id;
      
      if (!pageViewsMap[path]) {
        pageViewsMap[path] = { views: 0, uniqueVisitors: new Set() };
      }
      pageViewsMap[path].views += 1;
      pageViewsMap[path].uniqueVisitors.add(distinctId);
    });

    topPages = Object.entries(pageViewsMap)
      .map(([path, data]) => ({
        path,
        views: data.views,
        uniqueVisitors: data.uniqueVisitors.size,
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10);

    // Process device statistics
    const deviceMap: Record<string, Set<string>> = {};
    events.forEach((event: any) => {
      const device = event.properties?.$device_type || event.properties?.$os || 'Unknown';
      const distinctId = event.distinct_id;
      
      if (!deviceMap[device]) {
        deviceMap[device] = new Set();
      }
      deviceMap[device].add(distinctId);
    });

    deviceStats = Object.entries(deviceMap)
      .map(([device, users]) => ({
        device: device.charAt(0).toUpperCase() + device.slice(1),
        users: users.size,
      }))
      .sort((a, b) => b.users - a.users);

    // Process browser statistics
    const browserMap: Record<string, Set<string>> = {};
    events.forEach((event: any) => {
      const browser = event.properties?.$browser || 'Unknown';
      const distinctId = event.distinct_id;
      
      if (!browserMap[browser]) {
        browserMap[browser] = new Set();
      }
      browserMap[browser].add(distinctId);
    });

    browserStats = Object.entries(browserMap)
      .map(([browser, users]) => ({
        browser: browser.charAt(0).toUpperCase() + browser.slice(1),
        users: users.size,
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);

    // Process country statistics
    const countryMap: Record<string, Set<string>> = {};
    events.forEach((event: any) => {
      const country = event.properties?.$geoip_country_name || 'Unknown';
      const distinctId = event.distinct_id;
      
      if (!countryMap[country]) {
        countryMap[country] = new Set();
      }
      countryMap[country].add(distinctId);
    });

    countryStats = Object.entries(countryMap)
      .map(([country, users]) => ({
        country,
        users: users.size,
      }))
      .sort((a, b) => b.users - a.users)
      .slice(0, 10);

    // Process referrer statistics with better URL parsing
    const referrerMap: Record<string, number> = {};
    events.forEach((event: any) => {
      let referrer = event.properties?.$referrer || 'Direct';
      let source = 'Direct';
      
      if (referrer && referrer !== 'Direct' && referrer !== '$direct') {
        try {
          // Extract domain from URL
          const url = new URL(referrer);
          const hostname = url.hostname.toLowerCase();
          
          // Map common domains to friendly names
          if (hostname.includes('google.')) {
            source = 'Google';
          } else if (hostname.includes('facebook.') || hostname.includes('fb.')) {
            source = 'Facebook';
          } else if (hostname.includes('twitter.') || hostname.includes('t.co')) {
            source = 'Twitter';
          } else if (hostname.includes('instagram.')) {
            source = 'Instagram';
          } else if (hostname.includes('linkedin.')) {
            source = 'LinkedIn';
          } else if (hostname.includes('youtube.')) {
            source = 'YouTube';
          } else if (hostname.includes('tiktok.')) {
            source = 'TikTok';
          } else if (hostname.includes('pinterest.')) {
            source = 'Pinterest';
          } else {
            // Use the clean domain name for other sources
            source = hostname.replace(/^www\./, '');
          }
        } catch (error) {
          // If URL parsing fails, try to extract domain manually
          if (referrer.includes('google')) {
            source = 'Google';
          } else if (referrer.includes('facebook') || referrer.includes('fb')) {
            source = 'Facebook';
          } else if (referrer.includes('twitter')) {
            source = 'Twitter';
          } else {
            source = 'Other';
          }
        }
      }
      
      referrerMap[source] = (referrerMap[source] || 0) + 1;
    });

    referrerStats = Object.entries(referrerMap)
      .map(([source, views]) => ({ source, views }))
      .sort((a, b) => b.views - a.views);

    // Process daily page views with proper date range
    const dailyMap: Record<string, { views: number; uniqueVisitors: Set<string> }> = {};
    
    // Initialize all dates in the range with zero values
    for (let d = new Date(defaultStartDate); d <= defaultEndDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'yyyy-MM-dd');
      dailyMap[dateKey] = { views: 0, uniqueVisitors: new Set() };
    }
    
    // Fill in actual data from PostHog events
    pageViews.forEach((event: any) => {
      // Try multiple date field formats from PostHog
      let eventDate = null;
      let dateSource = 'unknown';
      
      if (event.timestamp) {
        eventDate = new Date(event.timestamp);
        dateSource = 'timestamp';
      } else if (event.time) {
        eventDate = new Date(event.time);
        dateSource = 'time';
      } else if (event.properties?.$time) {
        eventDate = new Date(event.properties.$time);
        dateSource = 'properties.$time';
      } else if (event.properties?.$timestamp) {
        eventDate = new Date(event.properties.$timestamp);
        dateSource = 'properties.$timestamp';
      } else {
        eventDate = new Date(); // Fallback to today
        dateSource = 'fallback_today';
      }
      
      // Check if date is valid
      if (isNaN(eventDate.getTime())) {
        console.warn(`Invalid date for event:`, event);
        eventDate = new Date();
        dateSource = 'fallback_invalid';
      }
      
      const dateKey = format(eventDate, 'yyyy-MM-dd');
      const distinctId = event.distinct_id;
      const todayKey = format(new Date(), 'yyyy-MM-dd');
      
      console.log(`Processing PostHog event: ${event.event} on ${dateKey} (source: ${dateSource}) for user ${distinctId}${dateKey === todayKey ? ' [TODAY]' : ''}`);
      
      if (dailyMap[dateKey]) {
        dailyMap[dateKey].views += 1;
        dailyMap[dateKey].uniqueVisitors.add(distinctId);
        
        if (dateKey === todayKey) {
          console.log(`✅ Added today's event: ${dailyMap[dateKey].views} total views today`);
        }
      } else {
        // If date is outside our range, still count it for debugging
        console.warn(`Event date ${dateKey} outside range ${format(defaultStartDate, 'yyyy-MM-dd')} to ${format(defaultEndDate, 'yyyy-MM-dd')}`);
      }
    });

    dailyPageViews = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        views: data.views,
        uniqueVisitors: data.uniqueVisitors.size,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
    
    const todayKey = format(new Date(), 'yyyy-MM-dd');
    const todayData = dailyPageViews.find(day => day.date === todayKey);
    
    console.info(`PostHog daily breakdown: ${dailyPageViews.length} days, total views: ${dailyPageViews.reduce((sum, day) => sum + day.views, 0)}`);
    console.info(`Today's data (${todayKey}): ${todayData ? `${todayData.views} views, ${todayData.uniqueVisitors} unique visitors` : 'No data found'}`);
    console.info(`Recent days:`, dailyPageViews.slice(-3));

    // Real funnel data from PostHog events
    const pageViewUsers = new Set(pageViews.map((e: any) => e.distinct_id));
    const productViewUsers = new Set(productViews.map((e: any) => e.distinct_id));
    const addToCartUsers = new Set(addToCarts.map((e: any) => e.distinct_id));
    const checkoutUsers = new Set(checkoutStarted.map((e: any) => e.distinct_id));
    const purchaseUsers = new Set(purchases.map((e: any) => e.distinct_id));

    // Real funnel data
    realFunnelData = [
      { 
        step: 'Page Views', 
        users: pageViewUsers.size || Math.max(totalPageViews, 1), 
        percentage: 100, 
        dropoff: 0 
      },
      { 
        step: 'Product Views', 
        users: productViewUsers.size, 
        percentage: pageViewUsers.size > 0 ? (productViewUsers.size / pageViewUsers.size) * 100 : 0,
        dropoff: pageViewUsers.size > 0 ? ((pageViewUsers.size - productViewUsers.size) / pageViewUsers.size) * 100 : 0
      },
      { 
        step: 'Add to Cart', 
        users: addToCartUsers.size, 
        percentage: pageViewUsers.size > 0 ? (addToCartUsers.size / pageViewUsers.size) * 100 : 0,
        dropoff: productViewUsers.size > 0 ? ((productViewUsers.size - addToCartUsers.size) / productViewUsers.size) * 100 : 0
      },
      { 
        step: 'Checkout', 
        users: checkoutUsers.size, 
        percentage: pageViewUsers.size > 0 ? (checkoutUsers.size / pageViewUsers.size) * 100 : 0,
        dropoff: addToCartUsers.size > 0 ? ((addToCartUsers.size - checkoutUsers.size) / addToCartUsers.size) * 100 : 0
      },
      { 
        step: 'Purchase', 
        users: Math.max(purchaseUsers.size, totalOrders), 
        percentage: pageViewUsers.size > 0 ? (Math.max(purchaseUsers.size, totalOrders) / pageViewUsers.size) * 100 : 0,
        dropoff: checkoutUsers.size > 0 ? ((checkoutUsers.size - Math.max(purchaseUsers.size, totalOrders)) / checkoutUsers.size) * 100 : 0
      },
    ];

  } else {
    // No PostHog data available - provide minimal daily structure
    console.warn('No PostHog events found. Analytics will show database-only metrics.');
    
    totalPageViews = 0;
    uniqueVisitors = 0;
    deviceStats = [];
    browserStats = [];
    countryStats = [];
    referrerStats = [];
    topPages = [];
    
    // Create minimal daily breakdown showing zero values for the date range
    const dailyMap: Record<string, { views: number; uniqueVisitors: number }> = {};
    for (let d = new Date(defaultStartDate); d <= defaultEndDate; d.setDate(d.getDate() + 1)) {
      const dateKey = format(d, 'yyyy-MM-dd');
      dailyMap[dateKey] = { views: 0, uniqueVisitors: 0 };
    }
    
    dailyPageViews = Object.entries(dailyMap)
      .map(([date, data]) => ({
        date,
        views: data.views,
        uniqueVisitors: data.uniqueVisitors,
      }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calculate metrics
  const averageSessionDuration = 180; // 3 minutes default
  const bounceRate = 35.0; // 35% default
  const conversionRate = totalPageViews > 0 ? (totalOrders / totalPageViews) * 100 : 0;

  // Get order items for product analysis
  const orderItems = await prisma.orderItem.findMany({
    where: {
      order: {
        createdAt: {
          gte: defaultStartDate,
          lte: defaultEndDate,
        },
      },
    },
    include: {
      product: {
        select: {
          name: true,
          category: true,
        },
      },
    },
  });

  // Product purchases analysis
  const productPurchases = orderItems.reduce((acc, item) => {
    if (item.product) {
      acc[item.productId] = {
        name: item.product.name,
        category: item.product.category,
        purchases: (acc[item.productId]?.purchases || 0) + item.quantity,
        revenue: (acc[item.productId]?.revenue || 0) + item.price,
      };
    }
    return acc;
  }, {} as Record<string, { name: string; category: string; purchases: number; revenue: number }>);

  // Create product analytics
  const topProducts = Object.values(productPurchases)
    .map(product => ({
      name: product.name,
      views: Math.floor(product.purchases * 8), // Estimate: 8 views per purchase
      purchases: product.purchases,
      revenue: product.revenue,
      conversionRate: 12.5, // 12.5% estimated conversion rate
    }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 10);

  // Category analysis
  const categoryData = Object.entries(
    Object.values(productPurchases).reduce((acc, product) => {
      acc[product.category] = (acc[product.category] || 0) + product.revenue;
      return acc;
    }, {} as Record<string, number>)
  ).map(([category, revenue]) => ({
    category: category.charAt(0).toUpperCase() + category.slice(1),
    revenue: revenue / 100, // Convert to rands
  }));

  // User activity metrics
  const userActivity = [
    { name: 'Total Visitors', value: uniqueVisitors },
    { name: 'Unique Visitors', value: uniqueVisitors },
    { name: 'Page Views', value: totalPageViews },
    { name: 'Total Orders', value: totalOrders },
    { name: 'Conversion Rate', value: `${conversionRate.toFixed(2)}%` },
    { name: 'Revenue', value: `R${(totalRevenue / 100).toFixed(2)}` },
    { name: 'Avg. Order Value', value: `R${totalOrders > 0 ? ((totalRevenue / totalOrders) / 100).toFixed(2) : '0.00'}` },
    { name: 'Bounce Rate', value: `${bounceRate.toFixed(1)}%` },
    { name: 'New Users', value: newUsersInPeriod },
  ];

  // Convert device stats for compatibility
  const deviceTypes = deviceStats.map(item => ({
    type: item.device,
    count: item.users,
  }));

  const browserTypes = browserStats.map(item => ({
    type: item.browser,
    count: item.users,
  }));

  // Growth metrics calculation
  const previousStartDate = subDays(defaultStartDate, 30);
  const previousEndDate = subDays(defaultEndDate, 30);
  
  const previousOrders = await prisma.order.count({
    where: {
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
  });

  const previousRevenue = await prisma.order.aggregate({
    where: {
      createdAt: {
        gte: previousStartDate,
        lte: previousEndDate,
      },
    },
    _sum: { amount: true },
  });

  const growthMetrics = {
    revenueGrowth: previousRevenue._sum.amount ? 
      ((totalRevenue - previousRevenue._sum.amount) / previousRevenue._sum.amount) * 100 : 0,
    orderGrowth: previousOrders ? 
      ((totalOrders - previousOrders) / previousOrders) * 100 : 0,
    trafficGrowth: 15.0, // Estimated growth when PostHog data is not available for comparison
  };

  // Calculate Customer Lifetime Value (LTV)
  const customerOrderData = await prisma.user.findMany({
    include: {
      orders: {
        select: {
          amount: true,
          createdAt: true,
        },
      },
    },
  });

  // Calculate LTV based on customer purchase history
  let totalCustomerRevenue = 0;
  let customersWithOrders = 0;
  
  customerOrderData.forEach(customer => {
    if (customer.orders.length > 0) {
      customersWithOrders++;
      
      // Calculate total revenue for this customer
      const customerRevenue = customer.orders.reduce((sum, order) => sum + order.amount, 0);
      totalCustomerRevenue += customerRevenue;
    }
  });

  // Calculate average customer lifetime value
  const averageCustomerRevenue = customersWithOrders > 0 ? totalCustomerRevenue / customersWithOrders : 0;
  const customerLifetimeValue = averageCustomerRevenue / 100; // Convert from cents to rands

  console.info(`Customer LTV calculation: ${customersWithOrders} customers with orders, avg LTV: R${customerLifetimeValue.toFixed(2)}`);

  // Funnel data - use real PostHog data if available, otherwise minimal real data
  const funnelData = realFunnelData.length > 0 ? realFunnelData : [
    { 
      step: 'Page Views', 
      users: Math.max(totalPageViews, 1), 
      percentage: 100, 
      dropoff: 0 
    },
    { 
      step: 'Product Views', 
      users: 0, 
      percentage: 0,
      dropoff: 100
    },
    { 
      step: 'Add to Cart', 
      users: 0, 
      percentage: 0,
      dropoff: 0
    },
    { 
      step: 'Checkout', 
      users: 0, 
      percentage: 0,
      dropoff: 0
    },
    { 
      step: 'Purchase', 
      users: totalOrders, 
      percentage: totalPageViews > 0 ? (totalOrders / Math.max(totalPageViews, 1)) * 100 : 0,
      dropoff: 0
    },
  ];

  return {
    // Core metrics
    totalRevenue: totalRevenue / 100,
    totalOrders,
    totalProducts,
    totalVisitors: uniqueVisitors,
    uniqueVisitors,
    totalPageViews,
    averageSessionDuration,
    bounceRate,
    conversionRate,
    
    // Time series data
    revenueData,
    pageViews: dailyPageViews,
    
    // User activity metrics
    userActivity,
    
    // Product analytics
    topProducts,
    topPages,
    categoryData,
    
    // User demographics and behavior
    deviceStats,
    topReferrers: referrerStats,
    userDemographics: countryStats,
    browserStats,
    
    // Sales funnel
    funnelData,
    
    // Growth metrics
    growthMetrics,
    
    // Additional metrics for compatibility
    operatingSystems: deviceStats.map(item => ({
      name: item.device,
      users: item.users,
      percentage: uniqueVisitors > 0 ? (item.users / uniqueVisitors) * 100 : 0,
    })),
    userRetention: [],
    conversionFunnel: funnelData,
    revenueMetrics: {
      totalRevenue: totalRevenue / 100,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders) / 100 : 0,
      revenueByProduct: topProducts.map(p => ({
        productId: p.name,
        revenue: p.revenue,
      })),
    },
    userBehavior: {
      averageSessionDuration,
      pagesPerSession: uniqueVisitors > 0 ? totalPageViews / uniqueVisitors : 0,
      exitPages: [],
    },
    revenueGrowth: growthMetrics.revenueGrowth,
    
    // Device and browser compatibility format
    deviceTypes,
    browserTypes,
    
    // Customer insights
    customerInsights: {
      newCustomers: newUsersInPeriod,
      returningCustomers: Math.max(0, uniqueVisitors - newUsersInPeriod),
      totalCustomers: totalUsers,
      averageOrderValue: totalOrders > 0 ? (totalRevenue / totalOrders) / 100 : 0,
      customerLifetimeValue: customerLifetimeValue,
    },
  };
}
