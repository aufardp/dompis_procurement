import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.berkas.findUnique({ where: { id }, select: { currentStage: true, currentPosisiId: true } });
  if (!existing) return NextResponse.json({ success: false, error: "Berkas not found" }, { status: 404 });

  const berkas = await prisma.berkas.update({
    where: { id },
    data: {
      approvalStatus: body.action === "revision" ? "REVISION" : "REJECTED",
      updatedById: user.id,
      tracking: {
        create: {
          fromStage: existing.currentStage,
          toStage: existing.currentStage,
          action: body.action === "revision" ? "REVISION" : "REJECT",
          note: body.note,
          createdById: user.id,
          toPosisiId: body.currentPosisiId || existing.currentPosisiId,
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: berkas });
}