import { Suspense } from 'react';
import { AnalyticsDashboardSkeleton } from '@/app/components/AnalyticsDashboardSkeleton';
import AnalyticsClient from "@/app/components/dashboard/analytics/AnalyticsClient";

export default function AnalyticsPage() {
  return (
    <div>
      <Suspense fallback={<AnalyticsDashboardSkeleton />}>
        <AnalyticsClient />
      </Suspense>
    </div>
  );
} 