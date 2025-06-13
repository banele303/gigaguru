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
}

export function MetricsCard({
  title,
  value,
  change,
  changeLabel,
  icon,
  className,
}: MetricsCardProps) {
  const isPositive = change && change > 0;
  const isNegative = change && change < 0;

  return (
    <Card className={cn("", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {change !== undefined && (
          <div className="flex items-center text-xs">
            {isPositive ? (
              <ArrowUpIcon className="mr-1 h-3 w-3 text-green-500" />
            ) : isNegative ? (
              <ArrowDownIcon className="mr-1 h-3 w-3 text-red-500" />
            ) : null}
            <span
              className={cn(
                "font-medium",
                isPositive && "text-green-500",
                isNegative && "text-red-500"
              )}
            >
              {Math.abs(change)}%
            </span>
            <span className="ml-1 text-muted-foreground">
              {changeLabel || "from last period"}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );
} 