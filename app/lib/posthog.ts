import posthog from 'posthog-js';

if (typeof window !== "undefined") {
  try {
    posthog.init(process.env.NEXT_PUBLIC_POSTHOG_API_KEY || "", {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://us.i.posthog.com",
      capture_pageview: true,
      capture_pageleave: true,
      autocapture: true,
      disable_session_recording: true,
      disable_persistence: false,
      disable_cookie: false,
      xhr_headers: {
        "Content-Type": "application/json",
      },
      on_xhr_error: (failedRequest) => {
        // Silently handle blocked requests
        console.debug("PostHog request blocked:", failedRequest);
      },
      bootstrap: {
        distinctID: undefined,
        isIdentifiedID: false,
      },
      persistence: "localStorage",
      persistence_name: "ph_" + (process.env.NEXT_PUBLIC_POSTHOG_API_KEY || "").substring(0, 6),
      advanced_disable_decide: true,
      loaded: (posthog) => {
        if (process.env.NODE_ENV === "development") {
          posthog.debug();
        }
      },
    });
  } catch (error) {
    console.debug("PostHog initialization failed:", error);
  }
}

export default posthog;

export interface AnalyticsData {
  uniqueVisitors: number;
  totalPageViews: number;
  averageTimeOnSite: number;
  bounceRate: number;
  topPages: Array<{ path: string; views: number }>;
  topReferrers: Array<{ source: string; views: number }>;
  deviceTypes: Array<{ type: string; count: number }>;
  browserTypes: Array<{ type: string; count: number }>;
  totalRevenue: number;
  totalOrders: number;
  revenueData: Array<{
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }>;
  userActivity: Array<{
    name: string;
    value: number | string;
  }>;
  topProducts: Array<{
    name: string;
    views: number;
    purchases: number;
  }>;
  pageViews: Array<{
    date: string;
    views: number;
    uniqueVisitors: number;
  }>;
  userDemographics: Array<{
    country: string;
    users: number;
  }>;
  deviceStats: Array<{
    device: string;
    users: number;
  }>;
  funnelData: Array<{
    step: string;
    users: number;
    dropoff: number;
  }>;
  operatingSystems: Array<{ name: string; count: number }>;
  userRetention: Array<{ cohort: string; percentage: number }>;
  conversionFunnel: Array<{ step: string; users: number; dropoff: number; }>;
  revenueMetrics: {
    totalRevenue: number;
    averageOrderValue: number;
    revenueByProduct: Array<{ productId: string; revenue: number; }>;
  };
  userBehavior: {
    averageSessionDuration: number;
    pagesPerSession: number;
    exitPages: Array<{ page: string; exits: number; }>;
  };
  searchAnalytics: Array<{ query: string; count: number; }>;
  revenueGrowth: number;
  activeUsers: number;
  userGrowth: number;
}

export const trackEvent = (eventName: string, properties?: Record<string, any>) => {
  posthog.capture(eventName, properties);
};

export const identifyUser = (userId: string, properties?: Record<string, any>) => {
  posthog.identify(userId, properties);
};

export const resetUser = () => {
  posthog.reset();
};

// Custom event tracking for e-commerce
export const trackProductView = (productId: string, productName: string, price: number) => {
  trackEvent('product_viewed', {
    product_id: productId,
    product_name: productName,
    price: price,
  });
};

export const trackAddToCart = (productId: string, productName: string, price: number, quantity: number) => {
  trackEvent('product_added_to_cart', {
    product_id: productId,
    product_name: productName,
    price: price,
    quantity: quantity,
  });
};

export const trackPurchase = (orderId: string, total: number, items: any[]) => {
  trackEvent('purchase_completed', {
    order_id: orderId,
    total: total,
    items: items,
  });
};

export const trackSearch = (searchTerm: string, resultsCount: number) => {
  trackEvent('search_performed', {
    search_term: searchTerm,
    results_count: resultsCount,
  });
};

export const trackUserSignup = (userId: string, method: string) => {
  trackEvent('user_signed_up', {
    user_id: userId,
    method: method,
  });
};

export const trackUserLogin = (userId: string, method: string) => {
  trackEvent('user_logged_in', {
    user_id: userId,
    method: method,
  });
};

// Helper function to format currency
export const formatCurrency = (amount: number) => {
  const sign = amount < 0 ? "-" : "";
  const absAmount = Math.abs(amount);

  if (absAmount >= 1_000_000) {
    return `${sign}R ${(absAmount / 1_000_000).toFixed(2)}M`;
  }
  if (absAmount >= 1_000) {
    return `${sign}R ${(absAmount / 1_000).toFixed(1)}K`;
  }

  const formatted = new Intl.NumberFormat('en-ZA', {
    style: 'currency',
    currency: 'ZAR',
  }).format(amount);

  return formatted.replace('ZAR', 'R');
};

// Helper function to format percentage
export const formatPercentage = (value: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
  }).format(value / 100);
};

// Helper function to format date
export const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}; 