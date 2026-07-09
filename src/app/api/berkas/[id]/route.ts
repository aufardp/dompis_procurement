import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const berkas = await prisma.berkas.findUnique({
    where: { id },
    include: {
      info: {
        include: { program: true, mitra: true, jenisPekerjaan: true, jenisTagihan: true, branch: true, region: true },
      },
      procurement: true,
      regional: true,
      currentPosisi: true,
      createdBy: { select: { name: true, nik: true } },
      updatedBy: { select: { name: true, nik: true } },
      tracking: {
        include: { fromPosisi: true, toPosisi: true, createdBy: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { createdAt: "desc" },
      },
      attachments: { where: { isDeleted: false }, orderBy: { createdAt: "desc" } },
    },
  });

  if (!berkas) {
    return NextResponse.json({ success: false, error: "Berkas not found" }, { status: 404 });
  }

  return NextResponse.json({ success: true, data: berkas });
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  try {
    const body = await request.json();
    const berkas = await prisma.berkas.update({
      where: { id },
      data: {
        ...body,
        updatedById: user.id,
        info: body.info ? {
          upsert: {
            create: body.info,
            update: body.info,
          },
        } : undefined,
      },
      include: { info: true, currentPosisi: true },
    });

    return NextResponse.json({ success: true, data: berkas });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  await prisma.berkas.update({
    where: { id },
    data: { deletedAt: new Date(), updatedById: user.id },
  });

  return NextResponse.json({ success: true, message: "Berkas deleted" });
}