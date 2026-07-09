import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getUserFromRequest } from "@/lib/auth";

export async function GET(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  const attachments = await prisma.attachment.findMany({
    where: { berkasId: id, isDeleted: false },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ success: true, data: attachments });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();

  const attachment = await prisma.attachment.create({
    data: {
      berkasId: id,
      uploadedById: user.id,
      fileName: body.fileName,
      originalName: body.originalName,
      extension: body.extension,
      mimeType: body.mimeType,
      fileSize: body.fileSize,
      path: body.path,
      storage: body.storage || "local",
      category: body.category,
      description: body.description,
      isDeleted: false,
    },
  });

  return NextResponse.json({ success: true, data: attachment }, { status: 201 });
}