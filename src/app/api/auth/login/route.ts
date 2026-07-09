import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { signToken } from "@/lib/jwt";

export async function POST(request: NextRequest) {
  try {
    const { nik, password } = await request.json();

    if (!nik || !password) {
      return NextResponse.json(
        { success: false, error: "NIK dan password wajib diisi" },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { nik },
      include: { role: true },
    });

    if (!user || user.status !== "ACTIVE") {
      return NextResponse.json(
        { success: false, error: "NIK atau password salah" },
        { status: 401 }
      );
    }

    const valid = await bcrypt.compare(password, user.password);
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "NIK atau password salah" },
        { status: 401 }
      );
    }

    const token = signToken({
      id: user.id,
      nik: user.nik,
      name: user.name,
      roleId: user.roleId,
      roleName: user.role.name,
      branchId: user.branchId,
      regionId: user.regionId,
    });

    return NextResponse.json({
      success: true,
      data: {
        token,
        user: {
          id: user.id,
          nik: user.nik,
          name: user.name,
          email: user.email,
          role: user.role.name,
        },
      },
    });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
