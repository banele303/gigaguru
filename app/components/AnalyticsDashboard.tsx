import { getAnalyticsData } from "@/app/lib/getAnalytics";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, ShoppingBag, Users, Package } from "lucide-react";
import { SalesCard } from "./SalesCard";

export async function AnalyticsDashboard() {
    const { totalRevenue, totalOrders, totalProducts } = await getAnalyticsData();

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <SalesCard
        title="Total Revenue"
        amount={`$${(totalRevenue / 100).toFixed(2)}`}
        icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
      />
      <SalesCard
        title="Total Sales"
        amount={`+${totalOrders}`}
        icon={<ShoppingBag className="h-4 w-4 text-muted-foreground" />}
      />
      <SalesCard
        title="Total Products"
        amount={`+${totalProducts}`}
        icon={<Package className="h-4 w-4 text-muted-foreground" />}
      />
    </div>
  );
}
