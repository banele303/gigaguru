"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PlusCircle, Mail, Clock, CheckCircle, XCircle } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const statusColors = {
  draft: "bg-gray-100 text-gray-800",
  scheduled: "bg-blue-100 text-blue-800",
  sending: "bg-yellow-100 text-yellow-800",
  sent: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

const statusIcons = {
  draft: Mail,
  scheduled: Clock,
  sending: Clock,
  sent: CheckCircle,
  failed: XCircle,
};

interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  status: string;
  scheduledAt: Date | null;
  recipientsCount: number;
  sentCount: number;
  failedCount: number;
}

interface EmailCampaignsClientProps {
  campaigns: EmailCampaign[];
}

export default function EmailCampaignsClient({ campaigns }: EmailCampaignsClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Email Campaigns</h1>
          <p className="text-muted-foreground">
            Create and manage your email marketing campaigns
          </p>
        </div>
        <Button asChild>
          <a href="/dashboard/email-campaigns/create">
            <PlusCircle className="mr-2 h-4 w-4" />
            Create Campaign
          </a>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Campaigns</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Scheduled For</TableHead>
                <TableHead>Recipients</TableHead>
                <TableHead>Sent</TableHead>
                <TableHead>Failed</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4 text-muted-foreground">
                    No campaigns found.
                  </TableCell>
                </TableRow>
              ) : (
                campaigns.map((campaign) => {
                  const StatusIcon = statusIcons[campaign.status as keyof typeof statusIcons];
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell className="font-medium">{campaign.name}</TableCell>
                      <TableCell>{campaign.subject}</TableCell>
                      <TableCell>
                        <Badge
                          variant="secondary"
                          className={statusColors[campaign.status as keyof typeof statusColors]}
                        >
                          <StatusIcon className="mr-1 h-3 w-3" />
                          {campaign.status.charAt(0).toUpperCase() + campaign.status.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {campaign.scheduledAt
                          ? format(campaign.scheduledAt, "MMM d, yyyy HH:mm")
                          : "-"}
                      </TableCell>
                      <TableCell>{campaign.recipientsCount}</TableCell>
                      <TableCell>{campaign.sentCount}</TableCell>
                      <TableCell>{campaign.failedCount}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                        >
                          <a href={`/dashboard/email-campaigns/${campaign.id}`}>
                            View Details
                          </a>
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
} 