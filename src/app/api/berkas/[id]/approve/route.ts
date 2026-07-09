import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requirePermission } from "@/lib/auth";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = requirePermission(request, "berkas:approve");
  if (user instanceof NextResponse) return user;

  const { id } = await params;
  const body = await request.json();

  const existing = await prisma.berkas.findUnique({ where: { id }, select: { currentStage: true, currentPosisiId: true } });
  if (!existing) return NextResponse.json({ success: false, error: "Berkas not found" }, { status: 404 });

  const berkas = await prisma.berkas.update({
    where: { id },
    data: {
      approvalStatus: "APPROVED",
      updatedById: user.id,
      tracking: {
        create: {
          fromStage: existing.currentStage,
          toStage: existing.currentStage,
          action: "APPROVE",
          note: body.note,
          createdById: user.id,
          toPosisiId: body.currentPosisiId || existing.currentPosisiId,
        },
      },
    },
  });

  return NextResponse.json({ success: true, data: berkas });
}