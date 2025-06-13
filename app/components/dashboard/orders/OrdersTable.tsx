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
import { formatPrice } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface Order {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  user: {
    firstName: string;
    email: string;
  };
  items: {
    product: {
      name: string;
    };
    quantity: number;
  }[];
}

export function OrdersTable({ orders }: { orders: Order[] }) {
  const [orderStatuses, setOrderStatuses] = useState<Record<string, string>>(
    orders.reduce((acc, order) => ({ ...acc, [order.id]: order.status }), {})
  );

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update order status");

      setOrderStatuses((prev) => ({
        ...prev,
        [orderId]: newStatus,
      }));

      toast.success("Order status updated successfully");
    } catch (error) {
      toast.error("Failed to update order status");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "processing":
        return "bg-blue-500/10 text-blue-500";
      case "shipped":
        return "bg-purple-500/10 text-purple-500";
      case "delivered":
        return "bg-green-500/10 text-green-500";
      case "cancelled":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Products</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Amount</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {orders.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{order.user.firstName}</p>
                <p className="text-sm text-muted-foreground">{order.user.email}</p>
              </div>
            </TableCell>
            <TableCell>
              <div className="max-w-[200px] truncate">
                {order.items.map((item) => (
                  <p key={item.product.name} className="text-sm">
                    {item.quantity}x {item.product.name}
                  </p>
                ))}
              </div>
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(orderStatuses[order.id])}>
                {orderStatuses[order.id]}
              </Badge>
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US").format(order.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              {formatPrice(order.amount / 100)}
            </TableCell>
            <TableCell className="text-right">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "pending")}
                  >
                    Mark as Pending
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "processing")}
                  >
                    Mark as Processing
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "shipped")}
                  >
                    Mark as Shipped
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "delivered")}
                  >
                    Mark as Delivered
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => updateOrderStatus(order.id, "cancelled")}
                  >
                    Mark as Cancelled
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