import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DiscountCodesTable } from "@/app/components/dashboard/promotions/DiscountCodesTable";
import { FlashSalesTable } from "@/app/components/dashboard/promotions/FlashSalesTable";
import { Button } from "@/components/ui/button";
import { PlusCircle } from "lucide-react";
import Link from "next/link";
import prisma from "@/app/lib/db";
import { unstable_noStore as noStore } from "next/cache";

async function getData() {
  const [discountCodes, flashSales] = await Promise.all([
    prisma.discountCode.findMany({
      include: {
        _count: {
          select: {
            redemptions: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.flashSale.findMany({
      include: {
        products: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        startDate: "desc",
      },
    }),
  ]);

  return {
    discountCodes,
    flashSales,
  };
}

export default async function PromotionsPage() {
  noStore();
  const { discountCodes, flashSales } = await getData();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Promotions</h2>
          <p className="text-muted-foreground">
            Manage discount codes and flash sales
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild>
            <Link href="/dashboard/promotions/discounts/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Discount
            </Link>
          </Button>
          <Button asChild>
            <Link href="/dashboard/promotions/flash-sales/create">
              <PlusCircle className="mr-2 h-4 w-4" />
              Create Flash Sale
            </Link>
          </Button>
        </div>
      </div>

      <Tabs defaultValue="discounts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="discounts">Discount Codes</TabsTrigger>
          <TabsTrigger value="flash-sales">Flash Sales</TabsTrigger>
        </TabsList>

        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Active Discount Codes</CardTitle>
            </CardHeader>
            <CardContent>
              <DiscountCodesTable discountCodes={discountCodes} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="flash-sales" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Flash Sales</CardTitle>
            </CardHeader>
            <CardContent>
              <FlashSalesTable flashSales={flashSales} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 