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

  const prevPosisi = await prisma.posisi.findFirst({
    where: { orderNo: { lt: berkas.currentPosisi.orderNo }, isActive: true },
    orderBy: { orderNo: "desc" },
  });

  if (!prevPosisi) {
    return NextResponse.json({ success: false, error: "No previous position" }, { status: 400 });
  }

  const prevStage = getPrevStage(berkas.currentStage);

  const updated = await prisma.berkas.update({
    where: { id },
    data: {
      currentStage: prevStage as any,
      currentPosisiId: prevPosisi.id,
      updatedById: user.id,
      tracking: {
        create: {
          fromStage: berkas.currentStage,
          toStage: prevStage as any,
          fromPosisiId: berkas.currentPosisiId,
          toPosisiId: prevPosisi.id,
          action: "RETURN",
          createdById: user.id,
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: updated });
}

function getPrevStage(stage: string): string {
  const stages = ["DRAFT", "REGIONAL", "PROCUREMENT", "FINANCE", "APM", "COMPLETED"];
  const idx = stages.indexOf(stage);
  return idx > 0 ? stages[idx - 1] : stage;
}