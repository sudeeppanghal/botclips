import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSessionUser } from "@/lib/auth";

// Helper to authenticate user
async function getAuthUser(req: NextRequest) {
  const session = await getSessionUser(req);
  if (!session) return null;
  return await prisma.user.findFirst({
    where: {
      OR: [
        ...(session.id ? [{ id: session.id }] : []),
        ...(session.email ? [{ email: session.email }] : [])
      ]
    },
  });
}

// GET /api/hybrid/campaigns/[id] - Get details of a single campaign with slots
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    const campaign = await prisma.hybridCampaign.findFirst({
      where: user.role === "ADMIN" ? { id: campaignId } : { id: campaignId, userId: user.id },
      include: {
        slots: {
          orderBy: { slotIndex: "asc" },
        },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, campaign });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to load campaign" }, { status: 500 });
  }
}

// PATCH /api/hybrid/campaigns/[id] - Pause, Resume, or Retry individual slot
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;
    const body = await request.json();
    const { action, slotIndex } = body;

    const campaign = await prisma.hybridCampaign.findFirst({
      where: user.role === "ADMIN" ? { id: campaignId } : { id: campaignId, userId: user.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // 1. Pause campaign
    if (action === "pause") {
      const updated = await prisma.hybridCampaign.update({
        where: { id: campaign.id },
        data: { status: "paused" },
      });
      return NextResponse.json({ success: true, message: "Campaign paused successfully", campaign: updated });
    }

    // 2. Resume campaign
    if (action === "resume") {
      const updated = await prisma.hybridCampaign.update({
        where: { id: campaign.id },
        data: { status: "active" },
      });
      return NextResponse.json({ success: true, message: "Campaign resumed successfully", campaign: updated });
    }

    // 3. Retry individual slot
    if (action === "retry_slot") {
      if (slotIndex == null) {
        return NextResponse.json({ error: "slotIndex is required to retry a pulse" }, { status: 400 });
      }

      const slot = await prisma.hybridSlot.findFirst({
        where: {
          campaignId: campaign.id,
          slotIndex: Number(slotIndex),
        },
      });

      if (!slot) {
        return NextResponse.json({ error: "Slot not found" }, { status: 404 });
      }

      // Reset slot to pending with immediate schedule
      const updatedSlot = await prisma.hybridSlot.update({
        where: { id: slot.id },
        data: {
          status: "pending",
          scheduledAt: new Date(),
          panelOrderId: null,
        },
      });

      // If campaign was completed or failed, reopen it as active
      if (campaign.status === "completed" || campaign.status === "failed") {
        await prisma.hybridCampaign.update({
          where: { id: campaign.id },
          data: { status: "active" },
        });
      }

      return NextResponse.json({
        success: true,
        message: `Pulse #${slotIndex} queued for immediate retry!`,
        slot: updatedSlot,
      });
    }

    return NextResponse.json({ error: "Invalid action. Supported: pause, resume, retry_slot" }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update campaign" }, { status: 500 });
  }
}

// DELETE /api/hybrid/campaigns/[id] - Cancel/purge a campaign
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    const campaign = await prisma.hybridCampaign.findFirst({
      where: user.role === "ADMIN" ? { id: campaignId } : { id: campaignId, userId: user.id },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    // Delete pending slots and mark campaign cancelled
    await prisma.$transaction(async (tx) => {
      await tx.hybridSlot.deleteMany({
        where: {
          campaignId: campaign.id,
          status: "pending",
        },
      });

      await tx.hybridCampaign.update({
        where: { id: campaign.id },
        data: { status: "cancelled" },
      });
    });

    return NextResponse.json({
      success: true,
      message: `Campaign "${campaign.name}" has been cancelled. Remaining pending pulses purged.`,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete campaign" }, { status: 500 });
  }
}
