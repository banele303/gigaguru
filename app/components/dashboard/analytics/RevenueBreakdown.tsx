"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { formatPrice } from "@/app/lib/utils";

interface RevenueBreakdownProps {
  data: {
    productId: string;
    _sum: {
      quantity: number | null;
    };
  }[];
}

export function RevenueBreakdown({ data }: RevenueBreakdownProps) {
  const chartData = data.map((item) => ({
    name: `Product ${item.productId}`,
    value: item._sum.quantity || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Revenue Breakdown</h3>
      </div>
      <ResponsiveContainer width="100%" height={350}>
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
            label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          />
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
} 