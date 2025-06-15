import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import { prisma } from "@/lib/db";
import { unstable_noStore as noStore } from "next/cache";
import { FlashSalesTable } from "@/app/components/dashboard/promotions/FlashSalesTable";

async function getData() {
  const flashSales = await prisma.flashSale.findMany({
    include: {
      products: {
        include: {
          product: {
            select: {
              name: true,
              price: true,
            },
          },
        },
      },
    },
    orderBy: {
      startDate: "desc",
    },
  });

  // Transform flash sales to match the expected type
  const transformedFlashSales = flashSales.map(sale => ({
    id: sale.id,
    name: sale.name,
    description: sale.description ?? "",
    startDate: sale.startDate,
    endDate: sale.endDate,
    isActive: sale.isActive,
    products: sale.products.map(item => ({
      product: {
        name: item.product.name,
        price: item.product.price,
      },
      discountPrice: item.discountPrice,
    })),
  }));

  return {
    flashSales: transformedFlashSales,
  };
}

export default async function FlashSalesPage() {
  noStore();
  const { flashSales } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Flash Sales</h2>
          <p className="text-muted-foreground">
            Manage time-limited product discounts
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/promotions/flash-sales/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Flash Sale
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Active Flash Sales</CardTitle>
        </CardHeader>
        <CardContent>
          <FlashSalesTable flashSales={flashSales} />
        </CardContent>
      </Card>
    </div>
  );
} 