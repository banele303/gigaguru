"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatPrice } from "@/app/lib/utils";

interface ProductAnalyticsProps {
  data: {
    mostViewed: {
      id: string;
      name: string;
      views: number;
      price: number;
    }[];
    bestSelling: {
      productId: string;
      _sum: {
        quantity: number | null;
      };
    }[];
  };
}

export function ProductAnalytics({ data }: ProductAnalyticsProps) {
  return (
    <div className="grid gap-4 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Most Viewed Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.mostViewed.map((product) => (
              <div
                key={product.id}
                className="flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {product.name}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatPrice(product.price)}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {product.views} views
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Best Selling Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.bestSelling.map((product) => (
              <div
                key={product.productId}
                className="flex items-center justify-between"
              >
                <div className="space-y-1">
                  <p className="text-sm font-medium leading-none">
                    Product ID: {product.productId}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {product._sum.quantity || 0} sold
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 