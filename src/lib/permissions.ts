import { JwtPayload } from "./jwt";

export type Permission =
  | "dashboard:view"
  | "berkas:view"
  | "berkas:create"
  | "berkas:edit"
  | "berkas:delete"
  | "berkas:approve"
  | "berkas:submit"
  | "tracking:view"
  | "master:view"
  | "master:create"
  | "master:edit"
  | "master:delete"
  | "laporan:view"
  | "settings:view"
  | "user:manage";

const rolePermissions: Record<string, Permission[]> = {
  superadmin: [
    "dashboard:view",
    "berkas:view",
    "berkas:create",
    "berkas:edit",
    "berkas:delete",
    "berkas:approve",
    "berkas:submit",
    "tracking:view",
    "master:view",
    "master:create",
    "master:edit",
    "master:delete",
    "laporan:view",
    "settings:view",
    "user:manage",
  ],
  procurement: [
    "dashboard:view",
    "berkas:view",
    "berkas:create",
    "berkas:edit",
    "berkas:approve",
    "berkas:submit",
    "tracking:view",
    "laporan:view",
  ],
  user: [
    "dashboard:view",
    "berkas:view",
    "tracking:view",
  ],
  mitra: [
    "dashboard:view",
    "berkas:view",
    "berkas:create",
    "berkas:edit",
    "berkas:submit",
    "tracking:view",
    "laporan:view",
  ],
};

export function hasPermission(user: JwtPayload, permission: Permission): boolean {
  const perms = rolePermissions[user.roleName];
  if (!perms) return false;
  return perms.includes(permission);
}

export function checkPermission(user: JwtPayload, permission: Permission): void {
  if (!hasPermission(user, permission)) {
    throw new Error("Forbidden: insufficient permissions");
  }
}

export function getMenuByRole(user: JwtPayload) {
  const isSuperadmin = hasPermission(user, "user:manage");
  const canManageMaster = hasPermission(user, "master:view");
  const canCreateBerkas = hasPermission(user, "berkas:create");
  const canViewLaporan = hasPermission(user, "laporan:view");
  const canViewSettings = hasPermission(user, "settings:view");

  return [
    { label: "Dashboard", href: "/dashboard", show: true },
    { label: "Berkas", href: "/berkas", show: hasPermission(user, "berkas:view") },
    { label: "Tracking", href: "/tracking", show: true },
    ...(canManageMaster
      ? [{
          label: "Master Data",
          href: "/master",
          children: [
            { label: "Role", href: "/master/role" },
            { label: "User", href: "/master/user" },
            { label: "Region", href: "/master/region" },
            { label: "Branch", href: "/master/branch" },
            { label: "Program", href: "/master/program" },
            { label: "Mitra", href: "/master/mitra" },
            { label: "Posisi", href: "/master/posisi" },
            { label: "Jenis Pekerjaan", href: "/master/jenis-pekerjaan" },
          ],
        }]
      : []),
    ...(canViewLaporan ? [{ label: "Laporan", href: "/laporan" }] : []),
    ...(canViewSettings ? [{ label: "Settings", href: "/settings" }] : []),
  ];
}
