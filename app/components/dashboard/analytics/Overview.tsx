"use client";

import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatPrice } from "@/app/lib/utils";

interface OverviewProps {
  data: {
    date: string;
    revenue: number;
    orders: number;
    views: number;
  }[];
}

const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="rounded-lg border bg-background p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Revenue
            </span>
            <span className="font-bold text-muted-foreground">
              {formatPrice(payload[0].value as number)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Orders
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[1].value}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Views
            </span>
            <span className="font-bold text-muted-foreground">
              {payload[2].value}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const xAxisProps = {
  dataKey: "date",
  stroke: "#888888",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
};

const yAxisProps = {
  stroke: "#888888",
  fontSize: 12,
  tickLine: false,
  axisLine: false,
  tickFormatter: (value: number) => formatPrice(value),
};

const lineProps = {
  type: "monotone" as const,
  strokeWidth: 2,
  dot: false,
};

export function Overview({ data }: OverviewProps) {
  return (
    <ResponsiveContainer width="100%" height={350}>
      <LineChart data={data}>
        <XAxis {...xAxisProps} />
        <YAxis {...yAxisProps} />
        <Tooltip content={CustomTooltip} />
        <Line
          {...lineProps}
          dataKey="revenue"
          stroke="#8884d8"
        />
        <Line
          {...lineProps}
          dataKey="orders"
          stroke="#82ca9d"
        />
        <Line
          {...lineProps}
          dataKey="views"
          stroke="#ffc658"
        />
      </LineChart>
    </ResponsiveContainer>
  );
} 