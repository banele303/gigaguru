"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format } from "date-fns";

export type Discount = {
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
};

export const columns: ColumnDef<Discount>[] = [
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      return (
        <Badge variant={type === "percentage" ? "secondary" : "default"}>
          {type === "percentage" ? "Percentage" : "Fixed Amount"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "value",
    header: "Value",
    cell: ({ row }) => {
      const type = row.getValue("type") as string;
      const value = row.getValue("value") as number;
      return type === "percentage" ? `${value}%` : `$${value}`;
    },
  },
  {
    accessorKey: "startDate",
    header: "Start Date",
    cell: ({ row }) => {
      const date = row.getValue("startDate") as Date;
      return format(new Date(date), "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "endDate",
    header: "End Date",
    cell: ({ row }) => {
      const date = row.getValue("endDate") as Date;
      return format(new Date(date), "MMM dd, yyyy");
    },
  },
  {
    accessorKey: "minPurchase",
    header: "Min. Purchase",
    cell: ({ row }) => {
      const value = row.getValue("minPurchase") as number;
      return `$${value}`;
    },
  },
  {
    accessorKey: "currentUses",
    header: "Usage",
    cell: ({ row }) => {
      const currentUses = row.getValue("currentUses") as number;
      const maxUses = row.getValue("maxUses") as number;
      return `${currentUses}/${maxUses}`;
    },
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => {
      const isActive = row.getValue("isActive") as boolean;
      return (
        <Badge variant={isActive ? "default" : "destructive"}>
          {isActive ? "Active" : "Inactive"}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const discount = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>
              <Pencil className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem className="text-destructive">
              <Trash className="mr-2 h-4 w-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
]; 