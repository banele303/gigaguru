import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { unstable_noStore as noStore } from "next/cache";
import { prisma } from "@/lib/db";
import EmailCampaignsClient from "./client";

type EmailCampaignWithRecipients = {
  id: string;
  name: string;
  subject: string;
  content: string;
  status: string;
  scheduledAt: Date | null;
  createdAt: Date;
  userId: string;
  recipients: {
    status: string;
  }[];
};

type EmailCampaignWithStats = EmailCampaignWithRecipients & {
  recipientsCount: number;
  sentCount: number;
  failedCount: number;
};

async function getData() {
  noStore();
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return { campaigns: [] }; // Handle unauthorized access gracefully
  }

  const campaigns = await prisma.emailCampaign.findMany({
    where: {
      userId: user.id,
    },
    include: {
      recipients: {
        select: {
          status: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
  });

  return {
    campaigns: campaigns.map((campaign: EmailCampaignWithRecipients): EmailCampaignWithStats => ({
      ...campaign,
      recipientsCount: campaign.recipients.length,
      sentCount: campaign.recipients.filter((r) => r.status === "sent").length,
      failedCount: campaign.recipients.filter((r) => r.status === "failed").length,
    })),
  };
}

export default async function EmailCampaignsPage() {
  const { campaigns } = await getData();
  return <EmailCampaignsClient campaigns={campaigns} />;
} 