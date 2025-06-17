"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { DateRange } from "react-day-picker";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DateRangePicker } from "@/app/components/ui/date-range-picker";
import { MetricsCard } from "@/app/components/dashboard/analytics/MetricsCard";
import { ChartCard } from "@/app/components/dashboard/analytics/ChartCard";
import { Users, ShoppingCart, DollarSign, Package } from "lucide-react";
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
} from "recharts";

// This interface must match the return type of getAnalytics
interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  averageOrderValue: number;
  salesOverTime: { date: string; revenue: number }[];
  topSellingProducts: { name: string; totalQuantity: number }[];
  categoryDistribution: { name: string; value: number }[];
  topCustomers: { name: string; totalSpent: number }[];
  startDate: Date;
  endDate: Date;
}

interface AnalyticsClientProps {
  initialData: AnalyticsData;
}

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8"];

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
};

export default function AnalyticsClient({ initialData }: AnalyticsClientProps) {
  const router = useRouter();
  const [data] = useState(initialData);
  const [dateRange, setDateRange] = useState<DateRange | undefined>({
    from: new Date(data.startDate),
    to: new Date(data.endDate),
  });

  useEffect(() => {
    const handleDateChange = () => {
      if (dateRange?.from && dateRange?.to) {
        const params = new URLSearchParams();
        params.set("from", dateRange.from.toISOString());
        params.set("to", dateRange.to.toISOString());
        router.push(`/dashboard/analytics?${params.toString()}`);
      }
    };
    handleDateChange();
  }, [dateRange, router]);

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Analytics</h1>
          <p className="text-muted-foreground">
            Your store's performance from{" "}
            <strong>{formatDate(data.startDate.toString())}</strong> to{" "}
            <strong>{formatDate(data.endDate.toString())}</strong>
          </p>
        </div>
        <DateRangePicker value={dateRange} onValueChange={setDateRange} />
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="customers">Customers</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <MetricsCard
              title="Total Revenue"
              value={formatCurrency(data.totalRevenue)}
              icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricsCard
              title="Total Sales"
              value={`+${data.totalOrders}`}
              icon={<ShoppingCart className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricsCard
              title="Total Customers"
              value={`+${data.totalCustomers}`}
              icon={<Users className="h-4 w-4 text-muted-foreground" />}
            />
            <MetricsCard
              title="Avg. Order Value"
              value={formatCurrency(data.averageOrderValue)}
              icon={<Package className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <ChartCard title="Sales Over Time" description="Revenue per day">
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data.salesOverTime}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tickFormatter={formatDate} />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="revenue"
                    stroke="#8884d8"
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <ChartCard
              title="Top Selling Products"
              description="The best-selling products in your store"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.topSellingProducts} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value: any) => `${value} units`} />
                    <Legend />
                    <Bar dataKey="totalQuantity" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </ChartCard>
            <ChartCard
              title="Category Distribution"
              description="Distribution of products across categories"
            >
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={data.categoryDistribution}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={100}
                      label
                    >
                      {data.categoryDistribution.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
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

        <TabsContent value="customers" className="space-y-4">
          <ChartCard
            title="Top Customers"
            description="Your most valuable customers by total amount spent"
          >
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.topCustomers}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis tickFormatter={(value) => formatCurrency(value)} />
                  <Tooltip formatter={(value: any) => formatCurrency(value)} />
                  <Legend />
                  <Bar dataKey="totalSpent" fill="#0088FE" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>
        </TabsContent>
      </Tabs>
    </div>
  );
}
