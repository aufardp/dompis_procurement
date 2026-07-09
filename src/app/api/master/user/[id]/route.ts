import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { requirePermission } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = requirePermission(request, "master:edit");
  if (auth instanceof NextResponse) return auth;

  try {
    const body = await request.json();

    const data: any = { ...body };
    if (data.password) {
      data.password = await bcrypt.hash(data.password, 12);
    } else {
      delete data.password;
    }
    delete data.id;
    delete data.createdAt;
    delete data.updatedAt;

    const item = await prisma.user.update({ where: { id }, data });
    return NextResponse.json({ success: true, data: item });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const auth = requirePermission(request, "master:delete");
  if (auth instanceof NextResponse) return auth;

  try {
    await prisma.user.delete({ where: { id } });
    return NextResponse.json({ success: true, message: "User deleted" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 400 });
  }
}