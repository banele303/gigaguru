"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";
import { DiscountDialog } from "./discount-dialog";

interface Discount {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: Date;
  endDate: Date;
  minPurchase: number;
  maxUses: number;
  currentUses: number;
  isActive: boolean;
}

export default function DiscountsPage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [discounts, setDiscounts] = useState<Discount[]>([]);
  const [loading, setLoading] = useState(true);

  const handleAddDiscount = () => {
    setIsDialogOpen(true);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Discounts</h2>
        <Button onClick={handleAddDiscount}>
          <Plus className="mr-2 h-4 w-4" />
          Add Discount
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discounts.filter((d) => d.isActive).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Discounts</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{discounts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Expiring Soon</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discounts.filter((d) => {
                const endDate = new Date(d.endDate);
                const now = new Date();
                const diffDays = Math.ceil((endDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
                return diffDays <= 7 && diffDays > 0;
              }).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usage</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {discounts.reduce((acc, curr) => acc + curr.currentUses, 0)}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Discount List</CardTitle>
        </CardHeader>
        <CardContent>
          <DataTable columns={columns} data={discounts} />
        </CardContent>
      </Card>

      <DiscountDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        onSave={(discount) => {
          setDiscounts([...discounts, discount]);
          setIsDialogOpen(false);
        }}
      />
    </div>
  );
} 