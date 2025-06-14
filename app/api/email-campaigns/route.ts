import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import { resend } from "@/lib/resend";
import { EmailCampaignWithRecipients, EmailCampaignRecipient } from "@/app/lib/zodSchemas";

export async function POST(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name, subject, content, scheduledAt, recipientIds } = body;

    if (!name || !subject || !content || !recipientIds || recipientIds.length === 0) {
      return new NextResponse("Missing required fields or recipients", { status: 400 });
    }

    const campaign = await prisma.emailCampaign.create({
      data: {
        name,
        subject,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "scheduled" : "draft",
        userId: user.id,
        recipients: {
          create: recipientIds.map((subscriberId: string) => ({
            subscriberId,
            status: "pending",
          })),
        },
      },
    });

    return NextResponse.json(campaign);
  } catch (error) {
    console.error("[EMAIL_CAMPAIGNS_POST]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
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

    const formattedCampaigns = campaigns.map((campaign: any) => ({
      ...campaign,
      recipientsCount: campaign.recipients.length,
      sentCount: campaign.recipients.filter((r: { status: string }) => r.status === "sent").length,
    })) as EmailCampaignWithRecipients[];

    return NextResponse.json(formattedCampaigns);
  } catch (error) {
    console.error("[EMAIL_CAMPAIGNS_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 