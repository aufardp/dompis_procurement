import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const berkas = await prisma.berkas.findUnique({
    where: { id },
    include: { currentPosisi: true },
  });

  if (!berkas) {
    return NextResponse.json({ success: false, error: "Berkas not found" }, { status: 404 });
  }

  const nextStage = await prisma.posisi.findFirst({
    where: { stage: getNextStage(berkas.currentStage) as any, isActive: true },
    orderBy: { orderNo: "asc" },
  });

  if (!nextStage) {
    return NextResponse.json({ success: false, error: "No next stage available" }, { status: 400 });
  }

  const updated = await prisma.berkas.update({
    where: { id },
    data: {
      currentStage: getNextStage(berkas.currentStage) as any,
      currentPosisiId: nextStage.id,
      updatedById: user.id,
      tracking: {
        create: {
          fromStage: berkas.currentStage,
          toStage: getNextStage(berkas.currentStage) as any,
          fromPosisiId: berkas.currentPosisiId,
          toPosisiId: nextStage.id,
          action: "SUBMIT",
          createdById: user.id,
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

function getNextStage(stage: string): string {
  const stages = ["DRAFT", "REGIONAL", "PROCUREMENT", "FINANCE", "APM", "COMPLETED"];
  const idx = stages.indexOf(stage);
  return idx >= 0 && idx < stages.length - 1 ? stages[idx + 1] : stage;
}