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
import { MoreHorizontal, Mail } from "lucide-react";
import { formatPrice } from "@/app/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";
import { toast } from "sonner";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  profileImage: string | null;
  createdAt: Date;
  _count: {
    orders: number;
  };
  totalSpent: number;
}

export function CustomersTable({ customers }: { customers: Customer[] }) {
  const [customerList, setCustomerList] = useState(customers);

  const sendEmail = async (email: string) => {
    try {
      const response = await fetch("/api/send-email", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) throw new Error("Failed to send email");

      toast.success("Email sent successfully");
    } catch (error) {
      toast.error("Failed to send email");
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Customer</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Orders</TableHead>
          <TableHead>Total Spent</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {customerList.map((customer) => (
          <TableRow key={customer.id}>
            <TableCell>
              <div className="flex items-center gap-3">
                <Avatar>
                  <AvatarImage src={customer.profileImage || undefined} />
                  <AvatarFallback>
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium">
                    {customer.firstName} {customer.lastName}
                  </p>
                </div>
              </div>
            </TableCell>
            <TableCell>{customer.email}</TableCell>
            <TableCell>{customer._count.orders}</TableCell>
            <TableCell>{formatPrice(customer.totalSpent / 100)}</TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US").format(customer.createdAt)}
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
                    onClick={() => sendEmail(customer.email)}
                    className="flex items-center gap-2"
                  >
                    <Mail className="h-4 w-4" />
                    Send Email
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
                      asChild
                    >
                      <a href={`/dashboard/customers/${customer.id}`}>
                        View Profile
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