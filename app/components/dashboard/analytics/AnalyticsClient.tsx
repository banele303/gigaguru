"use client";

import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MetricsCard } from "@/app/components/dashboard/analytics/MetricsCard";
import { ChartCard } from "@/app/components/dashboard/analytics/ChartCard";
import { TrafficSources } from "@/app/components/dashboard/analytics/TrafficSources";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ComposedChart,
} from "recharts";
import FunnelChart from './FunnelChart';
import {
  Users,
  Eye,
  ShoppingCart,
  DollarSign,
  TrendingUp,
  Globe,
  Smartphone,
  Search,
  Clock,
  MousePointer,
  CreditCard,
  Package,
  Target,
  BarChart3,
  Activity,
  Zap,
} from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

import { AnalyticsData, formatCurrency, formatPercentage, formatDate } from "@/app/lib/posthog";
interface GrowthMetrics {
  revenueGrowth: number;
  orderGrowth: number;
  trafficGrowth: number;
}
import { DateRangePicker } from "@/app/components/ui/date-range-picker";
import { addDays } from "date-fns";
import { DateRange } from "react-day-picker";

export const dynamic = 'force-dynamic';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#84cc16', '#f97316'];

const getIconForMetric = (metricName: string) => {
  switch (metricName) {
    case 'Total Visitors':
      return <Users className="h-4 w-4 text-blue-500" />;
    case 'Page Views':
      return <Eye className="h-4 w-4 text-green-500" />;
    case 'Total Orders':
      return <ShoppingCart className="h-4 w-4 text-purple-500" />;
    case 'Conversion Rate':
      return <Target className="h-4 w-4 text-orange-500" />;
    case 'Revenue':
      return <DollarSign className="h-4 w-4 text-emerald-500" />;
    case 'Avg. Order Value':
      return <CreditCard className="h-4 w-4 text-indigo-500" />;
    case 'Bounce Rate':
      return <MousePointer className="h-4 w-4 text-red-500" />;
    case 'New Users':
      return <Zap className="h-4 w-4 text-cyan-500" />;
    default:
      return <Activity className="h-4 w-4 text-muted-foreground" />;
  }
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-background border border-border rounded-lg shadow-lg p-3">
        <p className="font-semibold text-sm">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.name.includes('Rate') || entry.name.includes('%') 
              ? `${entry.value}%` 
              : entry.name.includes('Revenue') || entry.name.includes('Value')
              ? `R${entry.value.toFixed(2)}`
              : entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
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
      <div className="space-y-6 p-6 max-w-7xl mx-auto">
        {/* Header Skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-2">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-4 w-96" />
          </div>
          <Skeleton className="h-10 w-64" />
        </div>

        {/* Tabs Skeleton */}
        <div className="space-y-6">
          <Skeleton className="h-10 w-full max-w-md" />
          
          {/* Key Metrics Grid Skeleton */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="rounded-lg border p-6 space-y-3">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-4 w-4 rounded" />
                </div>
                <Skeleton className="h-8 w-20" />
                <div className="flex items-center space-x-2">
                  <Skeleton className="h-3 w-3 rounded" />
                  <Skeleton className="h-3 w-16" />
                  <Skeleton className="h-3 w-20" />
                </div>
              </div>
            ))}
          </div>

          {/* Charts Grid Skeleton */}
          <div className="grid gap-6 lg:grid-cols-2">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="rounded-lg border">
                <div className="p-6 pb-2">
                  <div className="space-y-2">
                    <Skeleton className="h-6 w-40" />
                    <Skeleton className="h-4 w-64" />
                  </div>
                </div>
                <div className="p-6 pt-0">
                  <Skeleton className="h-[350px] w-full rounded" />
                </div>
              </div>
            ))}
          </div>

          {/* Additional Content Skeleton */}
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-lg border">
              <div className="p-6 pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <Skeleton className="h-[300px] w-full rounded" />
              </div>
            </div>
            
            <div className="rounded-lg border">
              <div className="p-6 pb-2">
                <div className="flex items-center gap-2">
                  <Skeleton className="h-5 w-5 rounded" />
                  <Skeleton className="h-6 w-32" />
                </div>
              </div>
              <div className="p-6 pt-0">
                <div className="space-y-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-4 w-16" />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto">
            <Activity className="h-6 w-6 text-destructive" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-destructive">Error Loading Analytics</p>
            <p className="text-muted-foreground text-sm">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center">
        <div className="text-center space-y-4">
          <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
            <BarChart3 className="h-6 w-6 text-muted-foreground" />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold">No Data Available</p>
            <p className="text-muted-foreground">Start selling to see analytics data</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">
            Analytics Dashboard
          </h1>
          <p className="text-muted-foreground">
            Track and analyze your store&apos;s performance metrics
          </p>
        </div>
        <DateRangePicker
          value={dateRange}
          onValueChange={setDateRange}
        />
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6 lg:w-fit">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="traffic">Traffic</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="funnel">Funnel</TabsTrigger>
          <TabsTrigger value="insights">Insights</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[
              { name: 'Total Visitors', value: (data as any).totalVisitors || data.uniqueVisitors, icon: getIconForMetric('Total Visitors') },
              { name: 'Unique Visitors', value: data.uniqueVisitors, icon: getIconForMetric('Total Visitors') },
              { name: 'Page Views', value: data.totalPageViews || data.pageViews.reduce((sum, pv) => sum + pv.views, 0), icon: getIconForMetric('Page Views') },
              { name: 'Total Orders', value: data.totalOrders, icon: getIconForMetric('Total Orders') },
              { name: 'Revenue', value: formatCurrency(data.totalRevenue), icon: getIconForMetric('Revenue') },
              { name: 'Conversion Rate', value: `${((data.totalOrders / (data.totalPageViews || data.pageViews.reduce((sum, pv) => sum + pv.views, 0) || 1)) * 100).toFixed(2)}%`, icon: getIconForMetric('Conversion Rate') },
            ].map((metric, index) => (
              <MetricsCard
                key={index}
                title={metric.name}
                value={metric.value}
                icon={metric.icon}
                change={(data as any).growthMetrics ? 
                  (metric.name === 'Revenue' ? (data as any).growthMetrics.revenueGrowth :
                   metric.name === 'Total Orders' ? (data as any).growthMetrics.orderGrowth :
                   metric.name === 'Page Views' ? (data as any).growthMetrics.trafficGrowth : undefined) : undefined}
                trend={(data as any).growthMetrics ? 
                  (metric.name === 'Revenue' && (data as any).growthMetrics.revenueGrowth > 0 ? 'up' :
                   metric.name === 'Revenue' && (data as any).growthMetrics.revenueGrowth < 0 ? 'down' : 'neutral') : 'neutral'}
              />
            ))}
          </div>

          {/* Charts Grid */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Traffic Overview */}
            <ChartCard
              title="Traffic & Visitors"
              description="Daily page views and unique visitors from PostHog"
            >
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  {data.pageViews && data.pageViews.length > 0 ? (
                    <ComposedChart data={data.pageViews}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="date" 
                        tickFormatter={formatDate}
                        fontSize={12}
                        stroke="#888"
                      />
                      <YAxis fontSize={12} stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="views"
                        fill="#3b82f6"
                        fillOpacity={0.2}
                        stroke="#3b82f6"
                        strokeWidth={2}
                        name="Page Views"
                      />
                      <Line
                        type="monotone"
                        dataKey="uniqueVisitors"
                        stroke="#10b981"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Unique Visitors"
                      />
                    </ComposedChart>
                  ) : (
                    <div className="flex h-full items-center justify-center text-center">
                      <div className="space-y-2">
                        <div className="text-2xl font-bold text-muted-foreground">
                          {data.totalPageViews || 0}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Total Page Views
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Visit your site to see daily breakdowns
                        </div>
                      </div>
                    </div>
                  )}
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Revenue Overview */}
            <ChartCard
              title="Revenue & Orders"
              description="Daily revenue and order trends"
            >
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={data.revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis 
                      dataKey="date" 
                      tickFormatter={formatDate}
                      fontSize={12}
                      stroke="#888"
                    />
                    <YAxis yAxisId="revenue" orientation="left" fontSize={12} stroke="#888" />
                    <YAxis yAxisId="orders" orientation="right" fontSize={12} stroke="#888" />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                    <Bar
                      yAxisId="orders"
                      dataKey="orders"
                      fill="#8b5cf6"
                      name="Orders"
                      radius={[2, 2, 0, 0]}
                    />
                    <Line
                      yAxisId="revenue"
                      type="monotone"
                      dataKey="revenue"
                      stroke="#ef4444"
                      strokeWidth={2}
                      dot={{ r: 4 }}
                      name="Revenue (R)"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
          </div>

          {/* Top Performing Pages */}
          {(data as any).topPages && (data as any).topPages.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5 text-blue-500" />
                  Top Performing Pages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {(data as any).topPages.slice(0, 10).map((page: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                          #{index + 1}
                        </div>
                        <div className="space-y-1">
                          <p className="font-medium truncate max-w-[300px]">{page.productName}</p>
                          <p className="text-sm text-muted-foreground">{page.path}</p>
                          <Badge variant="outline" className="text-xs">
                            {page.category}
                          </Badge>
                        </div>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-lg font-semibold">{page.views.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Page Views</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{page.uniqueVisitors.toLocaleString()}</p>
                            <p className="text-xs text-muted-foreground">Unique Visitors</p>
                          </div>
                          <div className="text-center">
                            <p className="text-lg font-semibold">{(page.conversionRate || 0).toFixed(1)}%</p>
                            <p className="text-xs text-muted-foreground">Conversion</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Device Analytics */}
            <ChartCard
              title="Device Usage"
              description="Traffic distribution by device type"
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
                      outerRadius={120}
                      paddingAngle={5}
                    >
                      {data.deviceStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>

            {/* Traffic Sources */}
            <ChartCard
              title="Traffic Sources"
              description="Where your visitors come from"
            >
              <TrafficSources data={data.topReferrers} variant="hybrid" />
            </ChartCard>
          </div>
        </TabsContent>
        <TabsContent value="sales" className="space-y-6">
          <div className="grid gap-6">
            {/* Revenue Breakdown */}
            <div className="grid gap-6 lg:grid-cols-3">
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5 text-green-500" />
                    Revenue Trends
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={data.revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis 
                          dataKey="date" 
                          tickFormatter={formatDate}
                          fontSize={12}
                          stroke="#888"
                        />
                        <YAxis fontSize={12} stroke="#888" />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                          type="monotone"
                          dataKey="revenue"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                          name="Revenue (R)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
              
              {/* Customer Insights */}
              {(data as any).customerInsights && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Users className="h-5 w-5 text-blue-500" />
                      Customer Insights
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Total Customers</span>
                      <span className="font-semibold">{(data as any).customerInsights.totalCustomers}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">New Customers</span>
                      <Badge variant="secondary">{(data as any).customerInsights.newCustomers}</Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Avg. Order Value</span>
                      <span className="font-semibold">R{((data as any).customerInsights.averageOrderValue || 0).toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Customer LTV</span>
                      <span className="font-semibold">R{((data as any).customerInsights.customerLifetimeValue || 0).toFixed(2)}</span>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>

            {/* Category Performance */}
            {(data as any).categoryData && (data as any).categoryData.length > 0 && (
              <ChartCard
                title="Category Performance"
                description="Revenue and conversion rates by product category"
              >
                <div className="h-[350px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={(data as any).categoryData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        stroke="#888"
                        angle={-45}
                        textAnchor="end"
                        height={80}
                      />
                      <YAxis yAxisId="revenue" orientation="left" fontSize={12} stroke="#888" />
                      <YAxis yAxisId="rate" orientation="right" fontSize={12} stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        yAxisId="revenue"
                        dataKey="revenue"
                        fill="#3b82f6"
                        name="Revenue (R)"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        yAxisId="rate"
                        type="monotone"
                        dataKey="conversionRate"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Conversion Rate (%)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>
            )}
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          {data.topProducts && data.topProducts.length > 0 ? (
            <div className="grid gap-6">
              <ChartCard
                title="Top Performing Products"
                description="Products by views, purchases, and revenue"
              >
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <ComposedChart data={data.topProducts.slice(0, 10)}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis 
                        dataKey="name" 
                        fontSize={12}
                        stroke="#888"
                        angle={-45}
                        textAnchor="end"
                        height={100}
                        interval={0}
                      />
                      <YAxis yAxisId="count" orientation="left" fontSize={12} stroke="#888" />
                      <YAxis yAxisId="revenue" orientation="right" fontSize={12} stroke="#888" />
                      <Tooltip content={<CustomTooltip />} />
                      <Legend />
                      <Bar
                        yAxisId="count"
                        dataKey="views"
                        fill="#06b6d4"
                        name="Views"
                        radius={[2, 2, 0, 0]}
                      />
                      <Bar
                        yAxisId="count"
                        dataKey="purchases"
                        fill="#10b981"
                        name="Purchases"
                        radius={[2, 2, 0, 0]}
                      />
                      <Line
                        yAxisId="revenue"
                        type="monotone"
                        dataKey="revenue"
                        stroke="#ef4444"
                        strokeWidth={2}
                        dot={{ r: 4 }}
                        name="Revenue (R)"
                      />
                    </ComposedChart>
                  </ResponsiveContainer>
                </div>
              </ChartCard>

              <Card>
                <CardHeader>
                  <CardTitle>Product Performance Details</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {data.topProducts.slice(0, 10).map((product, index) => (
                      <div key={index} className="flex items-center justify-between p-3 rounded-lg border bg-card">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-semibold">
                            #{index + 1}
                          </div>
                          <div>
                            <p className="font-medium truncate max-w-[200px]">{product.name}</p>
                            <p className="text-sm text-muted-foreground">{product.views} views</p>
                          </div>
                        </div>
                        <div className="text-right space-y-1">
                          <p className="font-semibold">R{(product as any).revenue?.toFixed(2) || "0.00"}</p>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {product.purchases} sold
                            </Badge>
                            <Badge 
                              variant={(product as any).conversionRate > 5 ? "default" : "secondary"}
                              className="text-xs"
                            >
                              {(product as any).conversionRate?.toFixed(1) || "0.0"}% CVR
                            </Badge>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="flex h-[400px] items-center justify-center rounded-lg border border-dashed">
              <div className="text-center space-y-2">
                <Package className="h-8 w-8 text-muted-foreground mx-auto" />
                <p className="text-muted-foreground">No product performance data available</p>
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="funnel" className="space-y-6">
          <FunnelChart 
            data={data.funnelData.map((step, index) => ({
              ...step,
              percentage: index === 0 ? 100 : (step.users / data.funnelData[0].users) * 100
            }))}
            title="Sales Funnel Analysis" 
            description="Customer journey from product view to purchase"
          />
        </TabsContent>

        <TabsContent value="insights" className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Growth Metrics */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-500" />
                  Growth Metrics
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {(data as any).growthMetrics && (
                  <>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Revenue Growth</span>
                      <Badge 
                        variant={(data as any).growthMetrics.revenueGrowth > 0 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {(data as any).growthMetrics.revenueGrowth > 0 ? "+" : ""}{((data as any).growthMetrics.revenueGrowth || 0).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Order Growth</span>
                      <Badge 
                        variant={(data as any).growthMetrics.orderGrowth > 0 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {(data as any).growthMetrics.orderGrowth > 0 ? "+" : ""}{((data as any).growthMetrics.orderGrowth || 0).toFixed(1)}%
                      </Badge>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Traffic Growth</span>
                      <Badge 
                        variant={(data as any).growthMetrics.trafficGrowth > 0 ? "default" : "destructive"}
                        className="ml-2"
                      >
                        {(data as any).growthMetrics.trafficGrowth > 0 ? "+" : ""}{((data as any).growthMetrics.trafficGrowth || 0).toFixed(1)}%
                      </Badge>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Key Performance Indicators */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5 text-blue-500" />
                  Key Performance Indicators
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Bounce Rate</span>
                  <span className="font-semibold">{data.bounceRate?.toFixed(1) || "0.0"}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Conversion Rate</span>
                  <span className="font-semibold">{(data as any).conversionRate?.toFixed(2) || "0.00"}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Avg. Session Duration</span>
                  <span className="font-semibold">{data.userBehavior?.averageSessionDuration?.toFixed(1) || "0.0"} min</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-muted-foreground">Pages per Session</span>
                  <span className="font-semibold">{data.userBehavior?.pagesPerSession?.toFixed(1) || "0.0"}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recommendations */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-yellow-500" />
                Performance Insights & Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">🚀 Opportunities</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {(data as any).conversionRate && (data as any).conversionRate < 2 && (
                      <li>• Low conversion rate - consider improving product pages</li>
                    )}
                    {data.bounceRate && data.bounceRate > 70 && (
                      <li>• High bounce rate - improve page loading speed</li>
                    )}
                    {data.userBehavior?.pagesPerSession && data.userBehavior.pagesPerSession < 2 && (
                      <li>• Increase pages per session with related products</li>
                    )}
                    <li>• Implement cart abandonment recovery emails</li>
                  </ul>
                </div>

                <div className="space-y-3">
                  <h4 className="font-semibold text-sm">💡 Strengths</h4>
                  <ul className="text-sm text-muted-foreground space-y-1">
                    {(data as any).growthMetrics?.revenueGrowth && (data as any).growthMetrics.revenueGrowth > 0 && (
                      <li>• Positive revenue growth trend</li>
                    )}
                    {(data as any).conversionRate && (data as any).conversionRate > 3 && (
                      <li>• Good conversion rate performance</li>
                    )}
                    {(data as any).customerInsights?.averageOrderValue && (data as any).customerInsights.averageOrderValue > 50 && (
                      <li>• Strong average order value</li>
                    )}
                    <li>• Comprehensive analytics tracking in place</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
