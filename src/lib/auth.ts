import { NextRequest, NextResponse } from "next/server";
import { verifyToken, JwtPayload } from "./jwt";
import { hasPermission, Permission } from "./permissions";

export function getUserFromRequest(request: NextRequest): JwtPayload | null {
  const authHeader = request.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) return null;
  try {
    return verifyToken(authHeader.slice(7));
  } catch {
    return null;
  }
}

export function requireAuth(request: NextRequest): JwtPayload {
  const user = getUserFromRequest(request);
  if (!user) throw new Error("Unauthorized");
  return user;
}

export function requirePermission(request: NextRequest, permission: Permission): JwtPayload | NextResponse {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
  }
  if (!hasPermission(user, permission)) {
    return NextResponse.json({ success: false, error: "Forbidden" }, { status: 403 });
  }
  return user;
}
