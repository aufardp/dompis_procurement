import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest, requirePermission } from "@/lib/auth";
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

export async function GET(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const model = prismaModels[entity];
  if (!model) return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });

  const searchParams = request.nextUrl.searchParams;
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "20");
  const search = searchParams.get("search") || "";
  const isActive = searchParams.get("isActive");

  const where: any = {};
  if (isActive !== null) where.isActive = isActive === "true";
  if (search) {
    where.OR = [
      { name: { contains: search } },
      { code: { contains: search } },
    ];
  }

  const [items, total] = await Promise.all([
    model.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: "desc" },
    }),
    model.count({ where }),
  ]);

  return NextResponse.json({
    success: true,
    data: { items, total, page, limit, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;

  const auth = requirePermission(request, "master:create");
  if (auth instanceof NextResponse) return auth;

  const model = prismaModels[entity];
  if (!model) return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });

  try {
    const body = await request.json();

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 12);
    }

    const item = await model.create({ data: body });
    return NextResponse.json({ success: true, data: item }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const auth = requirePermission(request, "master:edit");
  if (auth instanceof NextResponse) return auth;

  const model = prismaModels[entity];
  if (!model) return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });

  try {
    const body = await request.json();
    const id = body.id;

    if (!id) {
      // Get ID from URL — Next.js doesn't pass it for PUT on this route
      const url = request.nextUrl.pathname.split("/");
      // Use body.id instead
    }

    if (body.password) {
      body.password = await bcrypt.hash(body.password, 12);
    } else {
      delete body.password;
    }
    delete body.id;
    delete body.createdAt;
    delete body.updatedAt;

    const item = await model.update({ where: { id: body._id } as any, data: body });

    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ entity: string }> }) {
  const { entity } = await params;
  const auth = requirePermission(request, "master:delete");
  if (auth instanceof NextResponse) return auth;

  const model = prismaModels[entity];
  if (!model) return NextResponse.json({ success: false, error: "Entity not found" }, { status: 404 });

  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ success: false, error: "ID required" }, { status: 400 });

    await model.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "Deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}