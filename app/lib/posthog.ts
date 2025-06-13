import posthog from 'posthog-js';

export interface AnalyticsData {
  pageViews: {
    date: string;
    views: number;
    uniqueVisitors: number;
    avgTimeOnPage: number;
  }[];
  userActivity: {
    action: string;
    count: number;
    conversionRate: number;
  }[];
  userDemographics: {
    country: string;
    users: number;
    percentage: number;
  }[];
  deviceStats: {
    device: string;
    users: number;
    percentage: number;
  }[];
  topProducts: {
    id: string;
    name: string;
    views: number;
    purchases: number;
    revenue: number;
  }[];
  funnelData: {
    step: string;
    users: number;
    dropoff: number;
  }[];
  revenueData: {
    date: string;
    revenue: number;
    orders: number;
    averageOrderValue: number;
  }[];
  userRetention: {
    cohort: string;
    day0: number;
    day1: number;
    day7: number;
    day30: number;
  }[];
  searchAnalytics: {
    term: string;
    searches: number;
    results: number;
    conversionRate: number;
  }[];
  totalRevenue: number;
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
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
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