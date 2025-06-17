import AnalyticsClient from "@/app/components/dashboard/analytics/AnalyticsClient";
import { getAnalytics } from "@/app/lib/getAnalytics";

export default async function AnalyticsPage({
  searchParams,
}: {
  searchParams?: { [key: string]: string | string[] | undefined };
}) {
  const from = searchParams?.from as string | undefined;
  const to = searchParams?.to as string | undefined;

  const analyticsData = await getAnalytics(
    from ? new Date(from) : undefined,
    to ? new Date(to) : undefined
  );

  return (
    <div>
      <AnalyticsClient initialData={analyticsData} />
    </div>
  );
} 