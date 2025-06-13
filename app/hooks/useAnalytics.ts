import { useEffect } from "react";

type AnalyticsEvent = {
  type: "page_view" | "cart_add" | "checkout_start" | "checkout_complete";
  productId?: string;
  source?: string;
  device?: string;
};

type CartAbandonmentEvent = {
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
  total: number;
};

export function useAnalytics() {
  const trackEvent = async (event: AnalyticsEvent) => {
    try {
      await fetch("/api/analytics/track", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...event,
          source: event.source || document.referrer || "direct",
          device: event.device || (/Mobile|Android|iPhone/i.test(navigator.userAgent) ? "mobile" : "desktop"),
        }),
      });
    } catch (error) {
      console.error("Error tracking event:", error);
    }
  };

  const trackCartAbandonment = async (event: CartAbandonmentEvent) => {
    try {
      await fetch("/api/analytics/cart-abandonment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(event),
      });
    } catch (error) {
      console.error("Error tracking cart abandonment:", error);
    }
  };

  const trackPageView = (productId?: string) => {
    trackEvent({
      type: "page_view",
      productId,
    });
  };

  const trackCartAdd = (productId: string) => {
    trackEvent({
      type: "cart_add",
      productId,
    });
  };

  const trackCheckoutStart = () => {
    trackEvent({
      type: "checkout_start",
    });
  };

  const trackCheckoutComplete = () => {
    trackEvent({
      type: "checkout_complete",
    });
  };

  return {
    trackEvent,
    trackCartAbandonment,
    trackPageView,
    trackCartAdd,
    trackCheckoutStart,
    trackCheckoutComplete,
  };
} 