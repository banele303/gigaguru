"use client";

import { useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import posthog from '@/app/lib/posthog';

export function AnalyticsProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Track page views
      const url = pathname + (searchParams.toString() ? `?${searchParams.toString()}` : '');
      
      posthog.capture('$pageview', {
        $current_url: url,
        page: pathname,
        search_params: searchParams.toString(),
      });

      // Track user engagement
      const handleScroll = () => {
        const scrolled = (window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100;
        if (scrolled > 75) {
          posthog.capture('deep_scroll', {
            page: pathname,
            scroll_percentage: scrolled,
          });
        }
      };

      const handleTimeOnPage = () => {
        posthog.capture('time_on_page', {
          page: pathname,
          duration: 30, // 30 seconds
        });
      };

      window.addEventListener('scroll', handleScroll, { once: true });
      const timeoutId = setTimeout(handleTimeOnPage, 30000);

      return () => {
        window.removeEventListener('scroll', handleScroll);
        clearTimeout(timeoutId);
      };
    }
  }, [pathname, searchParams]);

  return <>{children}</>;
}
