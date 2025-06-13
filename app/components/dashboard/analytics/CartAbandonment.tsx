"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface CartAbandonmentProps {
  data: number;
}

export function CartAbandonment({ data }: CartAbandonmentProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Cart Abandonment Rate</h3>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Current Rate</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{data.toFixed(1)}%</div>
          <p className="text-sm text-muted-foreground">
            Percentage of users who abandoned their cart
          </p>
        </CardContent>
      </Card>
    </div>
  );
} 