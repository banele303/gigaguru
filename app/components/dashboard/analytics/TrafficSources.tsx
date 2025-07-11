"use client";

import { Pie, PieChart, ResponsiveContainer, Tooltip, Cell, Bar, BarChart, XAxis, YAxis, CartesianGrid, Legend } from "recharts";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TrafficSourcesProps {
  data: {
    source: string | null;
    views?: number;
    _count?: {
      id: number;
    };
  }[];
  variant?: "pie" | "bar" | "hybrid";
}

export function TrafficSources({ data, variant = "hybrid" }: TrafficSourcesProps) {
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884D8", "#82CA9D", "#FFC658", "#FF7300"];

  const chartData = data.map((item) => ({
    name: item.source || "Direct",
    value: item.views || item._count?.id || 0,
    source: item.source || "Direct",
  })).sort((a, b) => b.value - a.value);

  const totalVisits = chartData.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = totalVisits > 0 ? ((data.value / totalVisits) * 100).toFixed(1) : 0;
      return (
        <div className="rounded-lg border bg-background p-3 shadow-lg">
          <div className="flex flex-col space-y-1">
            <span className="text-sm font-medium text-foreground">
              {data.payload.source}
            </span>
            <span className="text-xs text-muted-foreground">
              {data.value.toLocaleString()} visits ({percentage}%)
            </span>
          </div>
        </div>
      );
    }
    return null;
  };

  if (variant === "pie") {
    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
              label={false}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend 
              verticalAlign="bottom" 
              height={36}
              iconType="circle"
              formatter={(value, entry) => (
                <span className="text-sm text-muted-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    );
  }

  if (variant === "bar") {
    return (
      <div className="space-y-4">
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} layout="horizontal" margin={{ left: 80, right: 20, top: 20, bottom: 20 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis type="number" fontSize={12} stroke="#888" />
            <YAxis 
              type="category" 
              dataKey="source" 
              fontSize={11} 
              stroke="#888"
              width={75}
              tick={{ fontSize: 11 }}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="value" 
              fill="#06b6d4"
              radius={[0, 4, 4, 0]}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    );
  }

  // Hybrid view - combination of visual chart and detailed stats
  return (
    <div className="space-y-4 overflow-hidden">
      {/* Chart Section */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
        {/* Pie Chart */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Distribution</h4>
          <div className="w-full h-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData.slice(0, 6)} // Show top 6 sources
                  cx="50%"
                  cy="50%"
                  innerRadius={35}
                  outerRadius={75}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.slice(0, 6).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Stats List */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Top Sources</h4>
          <div className="space-y-1.5 max-h-[220px] overflow-y-auto pr-2">
            {chartData.slice(0, 6).map((item, index) => {
              const percentage = totalVisits > 0 ? ((item.value / totalVisits) * 100).toFixed(1) : 0;
              return (
                <div key={item.source} className="flex items-center justify-between p-2 rounded-md border bg-muted/20 hover:bg-muted/40 transition-colors">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <div 
                      className="w-2.5 h-2.5 rounded-full flex-shrink-0"
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium truncate" title={item.source}>
                        {item.source}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.value.toLocaleString()} visits
                      </p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-xs ml-2 flex-shrink-0">
                    {percentage}%
                  </Badge>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <div className="text-center p-2.5 rounded-md border bg-muted/20">
          <p className="text-lg font-bold text-foreground">{chartData.length}</p>
          <p className="text-xs text-muted-foreground">Sources</p>
        </div>
        <div className="text-center p-2.5 rounded-md border bg-muted/20">
          <p className="text-lg font-bold text-foreground">{totalVisits.toLocaleString()}</p>
          <p className="text-xs text-muted-foreground">Total Visits</p>
        </div>
        <div className="text-center p-2.5 rounded-md border bg-muted/20">
          <p className="text-lg font-bold text-foreground truncate" title={chartData[0]?.source || "N/A"}>
            {chartData[0]?.source || "N/A"}
          </p>
          <p className="text-xs text-muted-foreground">Top Source</p>
        </div>
        <div className="text-center p-2.5 rounded-md border bg-muted/20">
          <p className="text-lg font-bold text-foreground">
            {chartData[0] && totalVisits > 0 ? ((chartData[0].value / totalVisits) * 100).toFixed(1) : 0}%
          </p>
          <p className="text-xs text-muted-foreground">Top Share</p>
        </div>
      </div>
    </div>
  );
} 