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
import { MoreHorizontal, Copy } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface DiscountCode {
  id: string;
  code: string;
  type: "percentage" | "fixed";
  value: number;
  startDate: Date;
  endDate: Date;
  isActive: boolean;
  maxUses: number;
  _count: {
    redemptions: number;
  };
}

export function DiscountCodesTable({
  discountCodes,
}: {
  discountCodes: DiscountCode[];
}) {
  const [codes, setCodes] = useState(discountCodes);

  const copyToClipboard = (code: string) => {
    navigator.clipboard.writeText(code);
    toast.success("Discount code copied to clipboard");
  };

  const toggleActive = async (codeId: string) => {
    try {
      const response = await fetch(`/api/discount-codes/${codeId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          isActive: !codes.find((code) => code.id === codeId)?.isActive,
        }),
      });

      if (!response.ok) throw new Error("Failed to update discount code");

      setCodes((prev) =>
        prev.map((code) =>
          code.id === codeId ? { ...code, isActive: !code.isActive } : code
        )
      );

      toast.success("Discount code status updated");
    } catch (error) {
      toast.error("Failed to update discount code status");
    }
  };

  const formatValue = (code: DiscountCode) => {
    if (code.type === "percentage") {
      return `${code.value}%`;
    }
    return `$${(code.value / 100).toFixed(2)}`;
  };

  const getStatusColor = (code: DiscountCode) => {
    if (!code.isActive) return "bg-gray-500/10 text-gray-500";
    if (new Date() > code.endDate) return "bg-red-500/10 text-red-500";
    if (code._count.redemptions >= code.maxUses) return "bg-yellow-500/10 text-yellow-500";
    return "bg-green-500/10 text-green-500";
  };

  const getStatusText = (code: DiscountCode) => {
    if (!code.isActive) return "Inactive";
    if (new Date() > code.endDate) return "Expired";
    if (code._count.redemptions >= code.maxUses) return "Max Uses Reached";
    return "Active";
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Code</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Value</TableHead>
          <TableHead>Start Date</TableHead>
          <TableHead>End Date</TableHead>
          <TableHead>Uses</TableHead>
          <TableHead>Status</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {codes.map((code) => (
          <TableRow key={code.id}>
            <TableCell className="font-medium">
              <div className="flex items-center gap-2">
                {code.code}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => copyToClipboard(code.code)}
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
            <TableCell className="capitalize">{code.type}</TableCell>
            <TableCell>{formatValue(code)}</TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US").format(code.startDate)}
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US").format(code.endDate)}
            </TableCell>
            <TableCell>
              {code._count.redemptions} / {code.maxUses}
            </TableCell>
            <TableCell>
              <Badge className={getStatusColor(code)}>
                {getStatusText(code)}
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
                  <DropdownMenuItem onClick={() => toggleActive(code.id)}>
                    {code.isActive ? "Deactivate" : "Activate"}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => copyToClipboard(code.code)}
                  >
                    Copy Code
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