import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import bcrypt from "bcryptjs";

const prismaModels: Record<string, any> = {
  role: prisma.role,
  user: prisma.user,
  region: prisma.region,
  branch: prisma.branch,
  program: prisma.program,
  mitra: prisma.mitra,
  posisi: prisma.posisi,
  "jenis-pekerjaan": prisma.jenisPekerjaan,
  "jenis-tagihan": prisma.jenisTagihan,
  "workflow-config": prisma.workflowStageConfig,
};

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const { entity, id } = await params;
  const auth = requirePermission(request, "master:edit");
  if (auth instanceof NextResponse) return auth;

  const model = prismaModels[entity];
  if (!model) return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });

  try {
    const body = await request.json();

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 12);
    } else {
      delete body.password;
    }
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const item = await model.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string; id: string }> }
) {
  const { entity, id } = await params;
  const auth = requirePermission(request, "master:delete");
  if (auth instanceof NextResponse) return auth;

  const model = prismaModels[entity];
  if (!model) return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });

  try {
    await model.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}