import { useCallback } from 'react';
import { 
  trackEvent, 
  trackProductView, 
  trackAddToCart, 
  trackPurchase,
  trackSearch,
  trackUserSignup,
  trackUserLogin 
} from '@/app/lib/posthog';

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
  const trackPageView = useCallback((page: string, properties?: Record<string, any>) => {
    trackEvent('page_view', { page, ...properties });
  }, []);

  const trackButtonClick = useCallback((buttonName: string, location?: string) => {
    trackEvent('button_click', { button: buttonName, location });
  }, []);

  const trackFormSubmission = useCallback((formName: string, success: boolean) => {
    trackEvent('form_submission', { form: formName, success });
  }, []);

  const trackCartAction = useCallback((action: 'add' | 'remove' | 'update', productId: string, productName: string, quantity: number) => {
    trackEvent('cart_action', { 
      action, 
      product_id: productId, 
      product_name: productName, 
      quantity 
    });
  }, []);

  const trackCheckoutStep = useCallback((step: string, properties?: Record<string, any>) => {
    trackEvent('checkout_step', { step, ...properties });
  }, []);

  const trackDatabaseEvent = async (event: AnalyticsEvent) => {
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

  // Legacy methods for compatibility
  const trackDatabasePageView = (productId?: string) => {
    trackDatabaseEvent({
      type: "page_view",
      productId,
    });
  };

  const trackCartAdd = (productId: string) => {
    trackDatabaseEvent({
      type: "cart_add",
      productId,
    });
  };

  const trackCheckoutStart = () => {
    trackDatabaseEvent({
      type: "checkout_start",
    });
  };

  const trackCheckoutComplete = () => {
    trackDatabaseEvent({
      type: "checkout_complete",
    });
  };

  return {
    trackPageView,
    trackButtonClick,
    trackFormSubmission,
    trackCartAction,
    trackCheckoutStep,
    trackDatabaseEvent,
    trackCartAbandonment,
    trackProductView,
    trackAddToCart,
    trackPurchase,
    trackSearch,
    trackUserSignup,
    trackUserLogin,
    trackEvent,
    // Legacy methods
    trackDatabasePageView,
    trackCartAdd,
    trackCheckoutStart,
    trackCheckoutComplete,
  };
} 