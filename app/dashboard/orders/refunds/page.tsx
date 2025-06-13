"use client";

import { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

type Refund = {
  id: string;
  orderId: string;
  amount: number;
  status: "pending" | "approved" | "rejected";
  reason: string;
  createdAt: string;
};

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  rejected: "bg-red-100 text-red-800",
};

export default function RefundsPage() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [refunds, setRefunds] = useState<Refund[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRefunds();
  }, []);

  // Fetch refunds data
  const fetchRefunds = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/refunds");
      const data = await response.json();
      setRefunds(data);
    } catch (error) {
      toast.error("Failed to fetch refunds");
    } finally {
      setLoading(false);
    }
  };

  // Handle refund status update
  const handleStatusUpdate = async (refundId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/refunds/${refundId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error("Failed to update refund status");

      toast.success(`Refund ${newStatus} successfully`);
      fetchRefunds(); // Refresh the data
    } catch (error) {
      toast.error("Failed to update refund status");
    }
  };

  const filteredRefunds = refunds.filter((refund: Refund) => {
    const matchesSearch =
      refund.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      refund.orderId.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || refund.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Calculate statistics
  const stats = {
    pendingCount: refunds.filter((r) => r.status === "pending").length,
    totalRefunded: refunds
      .filter((r) => r.status === "approved")
      .reduce((sum, r) => sum + r.amount, 0),
    averageProcessingTime: "2.5 days", // This would need to be calculated based on your data
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Refund Requests</h1>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search refunds..."
              className="pl-8"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Refund Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Pending Refunds
              </div>
              <div className="mt-2 text-2xl font-bold">{stats.pendingCount}</div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Total Refunded
              </div>
              <div className="mt-2 text-2xl font-bold">
                ${stats.totalRefunded.toFixed(2)}
              </div>
            </div>
            <div className="rounded-lg border p-4">
              <div className="text-sm font-medium text-muted-foreground">
                Average Processing Time
              </div>
              <div className="mt-2 text-2xl font-bold">
                {stats.averageProcessingTime}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Refund ID</TableHead>
                <TableHead>Order ID</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredRefunds.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center">
                    No refunds found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRefunds.map((refund) => (
                  <TableRow key={refund.id}>
                    <TableCell className="font-medium">{refund.id}</TableCell>
                    <TableCell>{refund.orderId}</TableCell>
                    <TableCell>${refund.amount.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge
                        className={`${
                          statusColors[refund.status as keyof typeof statusColors]
                        }`}
                      >
                        {refund.status.charAt(0).toUpperCase() +
                          refund.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>{refund.reason}</TableCell>
                    <TableCell>
                      {new Date(refund.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            router.push(`/dashboard/orders/${refund.orderId}`);
                          }}
                        >
                          View Order
                        </Button>
                        {refund.status === "pending" && (
                          <>
                            <Button
                              variant="default"
                              size="sm"
                              className="bg-green-600 hover:bg-green-700"
                              onClick={() =>
                                handleStatusUpdate(refund.id, "approved")
                              }
                            >
                              Approve
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() =>
                                handleStatusUpdate(refund.id, "rejected")
                              }
                            >
                              Reject
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 