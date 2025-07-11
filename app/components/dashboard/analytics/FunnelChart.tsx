"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingDown, TrendingUp } from "lucide-react";

interface FunnelStep {
  step: string;
  users: number;
  percentage: number;
  dropoff?: number;
  color?: string;
  icon?: string;
}

interface FunnelChartProps {
  data: FunnelStep[];
  title?: string;
  description?: string;
}

export function FunnelChart({ data, title = "Sales Funnel", description = "Customer journey conversion rates" }: FunnelChartProps) {
  const maxUsers = Math.max(...data.map(step => step.users));
  
  // Default colors for funnel steps
  const defaultColors = [
    '#3b82f6', // Blue
    '#10b981', // Green
    '#f59e0b', // Yellow
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#06b6d4', // Cyan
  ];

  // Enhance data with colors and dropoff calculations
  const enhancedData = data.map((step, index) => {
    const color = step.color || defaultColors[index % defaultColors.length];
    const dropoff = index > 0 ? 
      ((data[index - 1].users - step.users) / data[index - 1].users) * 100 : 0;
    
    return {
      ...step,
      color,
      dropoff: step.dropoff || dropoff
    };
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {title}
        </CardTitle>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Visual Funnel */}
          <div className="relative flex flex-col items-center py-4">
            {enhancedData.map((step, index) => {
              const widthPercentage = (step.users / maxUsers) * 100;
              const isLast = index === enhancedData.length - 1;
              
              return (
                <div key={index} className="relative flex flex-col items-center w-full">
                  {/* Funnel Segment */}
                  <div className="relative group">
                    <div
                      className="transition-all duration-300 hover:scale-105 cursor-pointer rounded-lg shadow-sm hover:shadow-md"
                      style={{
                        width: `${Math.max(widthPercentage, 20)}%`,
                        height: '60px',
                        background: `linear-gradient(135deg, ${step.color}, ${step.color}dd)`,
                        clipPath: index === 0 
                          ? 'polygon(0 0, 100% 0, 90% 100%, 10% 100%)'
                          : isLast 
                          ? 'polygon(10% 0, 90% 0, 80% 100%, 20% 100%)'
                          : 'polygon(10% 0, 90% 0, 85% 100%, 15% 100%)',
                        minWidth: '200px'
                      }}
                    >
                      {/* Step Content */}
                      <div className="absolute inset-0 flex items-center justify-center text-white">
                        <div className="text-center">
                          <div className="text-sm font-medium truncate px-2">
                            {step.step}
                          </div>
                          <div className="text-lg font-bold">
                            {step.users.toLocaleString()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Tooltip on Hover */}
                    <div className="absolute left-1/2 transform -translate-x-1/2 -top-16 bg-black text-white text-xs rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10 whitespace-nowrap">
                      <div className="text-center">
                        <div className="font-medium">{step.step}</div>
                        <div>{step.users.toLocaleString()} users</div>
                        <div>{step.percentage.toFixed(1)}% conversion</div>
                        {step.dropoff > 0 && (
                          <div className="text-red-300">{step.dropoff.toFixed(1)}% drop-off</div>
                        )}
                      </div>
                      {/* Arrow */}
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-black"></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Conversion Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">
            {enhancedData.map((step, index) => {
              const conversionFromPrevious = index > 0 
                ? ((step.users / enhancedData[index - 1].users) * 100)
                : 100;
              
              return (
                <Card key={index} className="relative overflow-hidden">
                  <CardContent className="p-4">
                    <div className="space-y-3">
                      {/* Step Header */}
                      <div className="flex items-center justify-between">
                        <div className="text-sm font-medium text-muted-foreground">
                          Step {index + 1}
                        </div>
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: step.color }}
                        />
                      </div>

                      {/* Step Name */}
                      <div className="text-sm font-semibold text-foreground">
                        {step.step}
                      </div>

                      {/* Metrics */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">Users</span>
                          <span className="text-lg font-bold">{step.users.toLocaleString()}</span>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground">% of Total</span>
                          <Badge variant="outline" className="text-xs">
                            {step.percentage.toFixed(1)}%
                          </Badge>
                        </div>

                        {index > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Conversion</span>
                            <div className="flex items-center gap-1">
                              {conversionFromPrevious >= 50 ? (
                                <TrendingUp className="w-3 h-3 text-green-500" />
                              ) : (
                                <TrendingDown className="w-3 h-3 text-red-500" />
                              )}
                              <Badge 
                                variant={conversionFromPrevious >= 50 ? "default" : "destructive"} 
                                className="text-xs"
                              >
                                {conversionFromPrevious.toFixed(1)}%
                              </Badge>
                            </div>
                          </div>
                        )}

                        {step.dropoff > 0 && (
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Drop-off</span>
                            <Badge variant="destructive" className="text-xs">
                              -{step.dropoff.toFixed(1)}%
                            </Badge>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-transparent to-transparent">
                      <div 
                        className="h-full transition-all duration-500"
                        style={{ 
                          width: `${step.percentage}%`,
                          backgroundColor: step.color
                        }}
                      />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6 p-4 bg-muted/30 rounded-lg">
            <div className="text-center">
              <div className="text-2xl font-bold text-foreground">
                {enhancedData[0]?.users.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Total Visitors</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {enhancedData[enhancedData.length - 1]?.users.toLocaleString() || '0'}
              </div>
              <div className="text-sm text-muted-foreground">Conversions</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {enhancedData.length > 0 ? 
                  ((enhancedData[enhancedData.length - 1].users / enhancedData[0].users) * 100).toFixed(1) : '0'
                }%
              </div>
              <div className="text-sm text-muted-foreground">Overall Rate</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default FunnelChart;
