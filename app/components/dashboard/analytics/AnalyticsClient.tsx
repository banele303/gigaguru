"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "@/app/components/dashboard/analytics/MetricsCard";
import { ChartCard } from "@/app/components/dashboard/analytics/ChartCard";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
  AreaChart,
  Area,
} from "recharts";
import {
  Users,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Globe,
  Smartphone,
  Search,
  Clock,
} from "lucide-react";
import { AnalyticsData, formatCurrency, formatPercentage, formatDate } from "@/app/lib/posthog";
import { DateRangePicker } from "@/app/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

export const dynamic = 'force-dynamic';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const getIconForMetric = (metricName: string) => {
  switch (metricName) {
    case 'Total Users':
      return <Users className="h-4 w-4 text-muted-foreground" />;
    case 'Total Orders':
      return <ShoppingCart className="h-4 w-4 text-muted-foreground" />;
    case 'Product Views':
        return <TrendingUp className="h-4 w-4 text-muted-foreground" />;
    case 'Conversion Rate':
      return <Globe className="h-4 w-4 text-muted-foreground" />;
    default:
      return null;
  }
};

export default function AnalyticsClient() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: addDays(new Date(), -30),
    to: new Date(),
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/analytics', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            startDate: dateRange?.from?.toISOString(),
            endDate: dateRange?.to?.toISOString(),
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch analytics data');
        }

        setData(data);
      } catch (error) {
        console.error('Error fetching analytics data:', error);
        setError(error instanceof Error ? error.message : 'An error occurred while fetching analytics data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalyticsData();
  }, [dateRange]);

  if (isLoading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <div className="mb-4 h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="text-muted-foreground">Loading analytics data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading analytics data</p>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Track and analyze your store&apos;s performance
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onValueChange={setDateRange}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="revenue">Revenue</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {data.userActivity.map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric.name}
                value={metric.value}
                icon={getIconForMetric(metric.name)}
              />
            ))}
          </div>

          <div className="grid gap-4">
            <ChartCard
              title="Page Views & Unique Visitors"
              description="Daily page views and unique visitors over time"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.pageViews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={formatDate} />
                    <YAxis />
                    <Tooltip />
                    <Area
                      type="monotone"
                      dataKey="views"
                      stroke="#8884d8"
                      fill="#8884d8"
                      fillOpacity={0.3}
                    />
                    <Area
                      type="monotone"
                      dataKey="uniqueVisitors"
                      stroke="#82ca9d"
                      fill="#82ca9d"
                      fillOpacity={0.3}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="users" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {data.userDemographics && data.userDemographics.length > 0 && (
              <ChartCard
                title="User Demographics"
                description="User distribution by country"
              >
                <div className="h-[300px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={data.userDemographics}
                        dataKey="users"
                        nameKey="country"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label
                      >
                        {data.userDemographics.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}

            <ChartCard
              title="Device Usage"
              description="User distribution by device type"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.deviceStats}
                      dataKey="users"
                      nameKey="device"
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      label
                    >
                      {data.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          {data.topProducts.length > 0 ? (
            <ChartCard
              title="Top Products"
              description="Most viewed and purchased products"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topProducts}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="views" fill="#8884d8" />
                    <Bar dataKey="purchases" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          ) : (
            <div className="flex h-[300px] items-center justify-center rounded-lg border border-dashed">
              <p className="text-muted-foreground">No top products to display for this period.</p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="revenue" className="space-y-4">
          <ChartCard
            title="Revenue Over Time"
            description="Daily revenue and order count"
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.revenueData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="revenue" stroke="#8884d8" />
                  <Line type="monotone" dataKey="orders" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>

        <TabsContent value="funnel" className="space-y-4">
          <ChartCard
            title="Conversion Funnel"
            description="User progression through the sales funnel"
          >
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.funnelData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="step" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="users" fill="#8884d8" />
                  <Bar dataKey="dropoff" fill="#ff8042" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
