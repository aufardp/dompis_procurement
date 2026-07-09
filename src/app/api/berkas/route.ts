import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requirePermission } from "@/lib/auth";

export async function GET(request: NextRequest) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  try {
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const search = searchParams.get("search") || "";
    const stage = searchParams.get("stage") || "";
    const status = searchParams.get("status") || "";

    const where: any = {};
    if (search) {
      where.OR = [
        { nomor: { contains: search } },
        { info: { namaPekerjaan: { contains: search } } },
      ];
    }
    if (stage) where.currentStage = stage;
    if (status) where.approvalStatus = status;

    const [items, total] = await Promise.all([
      prisma.berkas.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: "desc" },
        include: {
          info: { include: { program: true, mitra: true } },
          currentPosisi: true,
          createdBy: { select: { name: true } },
        },
      }),
      prisma.berkas.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const user = requirePermission(request, "berkas:create");
  if (user instanceof NextResponse) return user;

  try {
    const body = await request.json();
    const berkas = await prisma.berkas.create({
      data: {
        nomor: body.nomor,
        currentStage: body.currentStage || "DRAFT",
        approvalStatus: "DRAFT",
        currentPosisiId: body.currentPosisiId,
        createdById: user.id,
        info: body.info ? {
          create: {
            namaPekerjaan: body.info.namaPekerjaan,
            dasarPermintaan: body.info.dasarPermintaan,
            nilaiPekerjaan: body.info.nilaiPekerjaan,
            programId: body.info.programId,
            branchId: body.info.branchId,
            regionId: body.info.regionId,
            mitraId: body.info.mitraId,
            jenisPekerjaanId: body.info.jenisPekerjaanId,
          },
        } : undefined,
      },
      include: { info: true, currentPosisi: true },
    });

    return NextResponse.json({ success: true, data: berkas }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}