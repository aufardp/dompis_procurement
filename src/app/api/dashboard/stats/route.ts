import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  const mitraFilter = user.roleName === "mitra" && user.mitraId
    ? { info: { mitraId: user.mitraId } }
    : {};

  const [totalBerkas, draft, completed, rejected, recentBerkas] = await Promise.all([
    prisma.berkas.count({ where: { deletedAt: null, ...mitraFilter } }),
    prisma.berkas.count({ where: { currentStage: "DRAFT", deletedAt: null, ...mitraFilter } }),
    prisma.berkas.count({ where: { currentStage: "COMPLETED", deletedAt: null, ...mitraFilter } }),
    prisma.berkas.count({ where: { approvalStatus: "REJECTED", deletedAt: null, ...mitraFilter } }),
    prisma.berkas.findMany({
      where: { deletedAt: null, createdAt: { gte: thirtyDaysAgo }, ...mitraFilter },
      orderBy: { createdAt: "desc" },
      take: 10,
      select: { id: true, nomor: true, currentStage: true, approvalStatus: true, createdAt: true },
    }),
  ]);

  return NextResponse.json({
    success: true,
    data: {
      totalBerkas,
      draft,
      pending: totalBerkas - draft - completed - rejected,
      completed,
      rejected,
      recentBerkas,
    },
  });
}