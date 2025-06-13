"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatPrice } from "@/app/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface PurchaseHistory {
  id: string;
  amount: number;
  status: string;
  createdAt: Date;
  user: {
    firstName: string;
    lastName: string;
    email: string;
    profileImage: string | null;
  };
  items: {
    product: {
      name: string;
      price: number;
    };
    quantity: number;
  }[];
}

export function PurchaseHistoryTable({
  purchaseHistory,
}: {
  purchaseHistory: PurchaseHistory[];
}) {
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

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
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
        </TableRow>
      </TableHeader>
      <TableBody>
        {purchaseHistory.map((order) => (
          <TableRow key={order.id}>
            <TableCell className="font-medium">#{order.id.slice(-6)}</TableCell>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={order.user.profileImage || undefined} />
                  <AvatarFallback>
                    {getInitials(order.user.firstName, order.user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {order.user.firstName} {order.user.lastName}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {order.user.email}
                  </p>
                </div>
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
              <Badge className={getStatusColor(order.status)}>
                {order.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US").format(order.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              {formatPrice(order.amount / 100)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 