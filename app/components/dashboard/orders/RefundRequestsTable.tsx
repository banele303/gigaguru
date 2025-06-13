"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/app/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";
import { toast } from "sonner";

interface RefundRequest {
  id: string;
  status: string;
  reason: string;
  createdAt: Date;
  order: {
    id: string;
    amount: number;
    user: {
      firstName: string;
      email: string;
    };
  };
}

export function RefundRequestsTable({
  refundRequests,
}: {
  refundRequests: RefundRequest[];
}) {
  const [requests, setRequests] = useState(refundRequests);

  const handleRefundRequest = async (requestId: string, action: "approve" | "reject") => {
    try {
      const response = await fetch(`/api/refunds/${requestId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action }),
      });

      if (!response.ok) throw new Error(`Failed to ${action} refund request`);

      setRequests((prev) =>
        prev.map((request) =>
          request.id === requestId
            ? { ...request, status: action === "approve" ? "approved" : "rejected" }
            : request
        )
      );

      toast.success(`Refund request ${action}d successfully`);
    } catch (error) {
      toast.error(`Failed to ${action} refund request`);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return "bg-yellow-500/10 text-yellow-500";
      case "approved":
        return "bg-green-500/10 text-green-500";
      case "rejected":
        return "bg-red-500/10 text-red-500";
      default:
        return "bg-gray-500/10 text-gray-500";
    }
  };

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Request ID</TableHead>
          <TableHead>Order ID</TableHead>
          <TableHead>Customer</TableHead>
          <TableHead>Reason</TableHead>
          <TableHead>Amount</TableHead>
          <TableHead>Status</TableHead>
          <TableHead>Date</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {requests.map((request) => (
          <TableRow key={request.id}>
            <TableCell className="font-medium">#{request.id.slice(-6)}</TableCell>
            <TableCell>#{request.order.id.slice(-6)}</TableCell>
            <TableCell>
              <div>
                <p className="font-medium">{request.order.user.firstName}</p>
                <p className="text-sm text-muted-foreground">
                  {request.order.user.email}
                </p>
              </div>
            </TableCell>
            <TableCell className="max-w-[200px] truncate">
              {request.reason}
            </TableCell>
            <TableCell>{formatPrice(request.order.amount / 100)}</TableCell>
            <TableCell>
              <Badge className={getStatusColor(request.status)}>
                {request.status}
              </Badge>
            </TableCell>
            <TableCell>
              {new Intl.DateTimeFormat("en-US").format(request.createdAt)}
            </TableCell>
            <TableCell className="text-right">
              {request.status === "pending" && (
                <div className="flex justify-end gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRefundRequest(request.id, "approve")}
                  >
                    Approve
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRefundRequest(request.id, "reject")}
                  >
                    Reject
                  </Button>
                </div>
              )}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
} 