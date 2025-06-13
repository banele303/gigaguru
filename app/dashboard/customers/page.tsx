import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomersTable } from "@/app/components/dashboard/customers/CustomersTable";
import { PurchaseHistoryTable } from "@/app/components/dashboard/customers/PurchaseHistoryTable";
import prisma from "@/app/lib/db";
import { unstable_noStore as noStore } from "next/cache";

type CustomerWithOrders = {
  id: string;
  name: string | null;
  email: string;
  createdAt: Date;
  _count: {
    orders: number;
  };
  orders: {
    amount: number;
  }[];
};

type CustomerWithTotalSpent = CustomerWithOrders & {
  totalSpent: number;
};

async function getData() {
  const [customers, purchaseHistory] = await Promise.all([
    prisma.user.findMany({
      include: {
        _count: {
          select: {
            orders: true,
          },
        },
        orders: {
          select: {
            amount: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
    prisma.order.findMany({
      include: {
        user: true,
        items: {
          include: {
            product: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    }),
  ]);

  return {
    customers: customers.map((customer: CustomerWithOrders): CustomerWithTotalSpent => ({
      ...customer,
      totalSpent: customer.orders.reduce((acc, order) => acc + order.amount, 0),
    })),
    purchaseHistory,
  };
}

export default async function CustomersPage() {
  noStore();
  const { customers, purchaseHistory } = await getData();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Customers</h2>
        <p className="text-muted-foreground">
          Manage customer profiles and view purchase history
        </p>
      </div>

      <Tabs defaultValue="customers" className="space-y-4">
        <TabsList>
          <TabsTrigger value="customers">All Customers</TabsTrigger>
          <TabsTrigger value="purchase-history">Purchase History</TabsTrigger>
        </TabsList>

        <TabsContent value="customers" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Customer Profiles</CardTitle>
            </CardHeader>
            <CardContent>
              <CustomersTable customers={customers} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="purchase-history" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Purchase History</CardTitle>
            </CardHeader>
            <CardContent>
              <PurchaseHistoryTable purchaseHistory={purchaseHistory} />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
} 