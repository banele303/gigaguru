"use client";

import { useEffect } from 'react';
import posthog from '@/app/lib/posthog';

interface UseProductViewProps {
  productId: string;
  productName: string;
  price: number;
}

export function useProductView({ productId, productName, price }: UseProductViewProps) {
  useEffect(() => {
    if (!productId) return;

    const trackView = async () => {
      try {
        // Primary tracking with PostHog client-side
        if (typeof window !== 'undefined' && posthog) {
          posthog.capture('product_view', {
            product_id: productId,
            product_name: productName,
            product_price: price,
            source: document.referrer ? 'referral' : 'direct',
            device_type: /Mobile|Android|iPhone|iPad/.test(navigator.userAgent) ? 'mobile' : 'desktop',
            timestamp: new Date().toISOString(),
            page_url: window.location.href,
            referrer: document.referrer,
          });

          // Also track a pageview for analytics
          posthog.capture('$pageview', {
            $current_url: window.location.href,
            product_id: productId,
            product_name: productName,
            page_type: 'product',
          });
        }

        // Backup server-side tracking (optional, can be removed for pure PostHog approach)
        await fetch('/api/analytics/track-view', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productId,
            productName,
            price,
            source: document.referrer ? 'referral' : 'direct',
          }),
        });
      } catch (error) {
        console.debug('Product view tracking failed:', error);
      }
    };

    // Track view after a short delay to ensure the page is fully loaded
    const timer = setTimeout(trackView, 1000);

    return () => clearTimeout(timer);
  }, [productId, productName, price]);
}

// Declare PostHog type for TypeScript
declare global {
  interface Window {
    posthog?: {
      capture: (event: string, properties?: Record<string, any>) => void;
    };
  }
}
