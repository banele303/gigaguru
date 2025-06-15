"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { MoreHorizontal } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface FlashSale {
  id: string;
  name: string;
  description: string;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  products: {
    product: {
      name: string;
      price: number;
    };
    discountPrice: number;
  }[];
}

export function FlashSalesTable({
  flashSales,
}: {
  flashSales: FlashSale[];
}) {
  const [sales, setSales] = useState(flashSales);

  const toggleActive = async (saleId: string) => {
    try {
      const response = await fetch(`/api/flash-sales/${saleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !sales.find((sale) => sale.id === saleId)?.isActive,
        }),
      });

      if (!response.ok) throw new Error("Failed to update flash sale");

      setSales((prev) =>
        prev.map((sale) =>
          sale.id === saleId ? { ...sale, isActive: !sale.isActive } : sale
        )
      );

      toast.success("Flash sale status updated");
    } catch (error) {
      toast.error("Failed to update flash sale status");
    }
  };

  const getStatusColor = (sale: FlashSale) => {
    if (!sale.isActive) return "bg-gray-500/10 text-gray-500";
    if (new Date() > sale.endDate) return "bg-red-500/10 text-red-500";
    if (new Date() < sale.startDate) return "bg-yellow-500/10 text-yellow-500";
    return "bg-green-500/10 text-green-500";
  };

  const getStatusText = (sale: FlashSale) => {
    if (!sale.isActive) return "Inactive";
    if (new Date() > sale.endDate) return "Ended";
    if (new Date() < sale.startDate) return "Scheduled";
    return "Active";
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "ZAR",
    }).format(price / 100);
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Description</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {sales.map((sale) => (
          <TableRow key={sale.id}>
            <TableCell className="font-medium">{sale.name}</TableCell>
            <TableCell className="max-w-[200px] truncate">
              {sale.description}
            </TableCell>
            <TableCell>
              <div className="space-y-1">
                {sale.products.map((item) => (
                  <div key={item.product.name} className="text-sm">
                    <p className="font-medium">{item.product.name}</p>
                    <p className="text-muted-foreground">
                      {formatPrice(item.product.price)} →{" "}
                      {formatPrice(item.discountPrice)}
                    </p>
                  </div>
                ))}
              </div>
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(sale.startDate)}
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US", {
                dateStyle: "medium",
                timeStyle: "short",
              }).format(sale.endDate)}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(sale)}>
                {getStatusText(sale)}
              </Badge>
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => toggleActive(sale.id)}>
                    {sale.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={`/dashboard/promotions/flash-sales/${sale.id}/edit`}>
                        Edit
                      </a>
                    </Button>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 