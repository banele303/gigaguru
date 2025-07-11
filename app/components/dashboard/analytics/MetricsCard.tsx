import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface MetricsCardProps {
  title: string;
  value: string | number;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  className?: string;
  trend?: "up" | "down" | "neutral";
  description?: string;
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
  trend = "neutral",
  description,
}: MetricsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600 dark:text-green-400";
      case "down":
        return "text-red-600 dark:text-red-400";
      default:
        return "text-gray-600 dark:text-gray-400";
    }
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md border-l-4 border-l-primary/20", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col space-y-1">
          <div className="text-2xl font-bold tracking-tight">{value}</div>
          {change !== undefined && (
            <div className={cn("flex items-center text-xs", getTrendColor())}>
              {isPositive ? (
                <ArrowUpIcon className="mr-1 h-3 w-3" />
              ) : isNegative ? (
                <ArrowDownIcon className="mr-1 h-3 w-3" />
              ) : null}
              <span className="font-medium">
                {change > 0 ? "+" : ""}{change.toFixed(1)}%
              </span>
              <span className="ml-1 opacity-70">
                {changeLabel || "from last period"}
              </span>
            </div>
          )}
          {description && (
            <p className="text-xs text-muted-foreground opacity-80">{description}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 