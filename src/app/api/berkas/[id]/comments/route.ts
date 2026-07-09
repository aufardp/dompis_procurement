import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const comments = await prisma.comment.findMany({
    where: { berkasId: id },
    include: { user: { select: { name: true, nik: true } } },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: comments });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const comment = await prisma.comment.create({
    data: {
      berkasId: id,
      userId: user.id,
      message: body.message,
    },
    include: { user: { select: { name: true } } },
  });

  return NextResponse.json({ success: true, data: comment }, { status: 201 });
}