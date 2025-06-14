import { NextResponse } from "next/server";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { prisma } from "@/lib/db";
import { EmailCampaignWithRecipients, EmailCampaignRecipient } from "@/app/lib/zodSchemas";

export async function GET(
  req: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.campaignId) {
      return new NextResponse("Campaign ID missing", { status: 400 });
    }

    const campaign = await prisma.emailCampaign.findUnique({
      where: {
        id: params.campaignId,
        userId: user.id,
      },
      include: {
        recipients: {
          select: {
            subscriberId: true,
          },
        },
      },
    });

    if (!campaign) {
      return new NextResponse("Campaign not found", { status: 404 });
    }

    // Format recipients for client-side use
    const formattedCampaign = {
      ...campaign,
      recipientIds: campaign.recipients.map((recipient: { subscriberId: string }) => recipient.subscriberId),
    } as EmailCampaignWithRecipients;

    return NextResponse.json(formattedCampaign);
  } catch (error) {
    console.error("[EMAIL_CAMPAIGN_GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { campaignId: string } }
) {
  try {
    const { getUser } = getKindeServerSession();
    const user = await getUser();

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.campaignId) {
      return new NextResponse("Campaign ID missing", { status: 400 });
    }

    const body = await req.json();
    const { name, subject, content, scheduledAt, recipientIds } = body;

    if (!name || !subject || !content || !recipientIds || recipientIds.length === 0) {
      return new NextResponse("Missing required fields or recipients", { status: 400 });
    }

    // Check if campaign exists and belongs to the user
    const existingCampaign = await prisma.emailCampaign.findUnique({
      where: {
        id: params.campaignId,
        userId: user.id,
      },
    });

    if (!existingCampaign) {
      return new NextResponse("Campaign not found or unauthorized", { status: 404 });
    }

    // Update campaign details
    const updatedCampaign = await prisma.emailCampaign.update({
      where: {
        id: params.campaignId,
      },
      data: {
        name,
        subject,
        content,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
        status: scheduledAt ? "scheduled" : existingCampaign.status === "sent" ? "sent" : "draft", // Keep sent status if already sent
      },
    });

    // Update recipients (delete old and create new)
    await prisma.emailCampaignRecipient.deleteMany({
      where: {
        campaignId: updatedCampaign.id,
      },
    });

    const recipientsData = recipientIds.map((subscriberId: string) => ({
      campaignId: updatedCampaign.id,
      subscriberId: subscriberId,
      status: "pending",
    }));

    await prisma.emailCampaignRecipient.createMany({
      data: recipientsData,
    });

    // TODO: Add logic to re-send or update scheduled send if campaign is not scheduled and not sent
    // For now, if not scheduled and not sent, it will be marked as 'draft' or 'sending' depending on further action.

    return NextResponse.json(updatedCampaign);
  } catch (error) {
    console.error("[EMAIL_CAMPAIGN_PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
} 