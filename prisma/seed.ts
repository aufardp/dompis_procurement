import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  await prisma.user.deleteMany({});
  await prisma.branch.deleteMany({});
  await prisma.region.deleteMany({});
  await prisma.role.deleteMany({});

  // ── Roles ──────────────────────────────────────
  const roleSuperadmin = await prisma.role.create({
    data: { name: "superadmin", description: "Super Administrator — akses penuh" },
  });
  const roleProcurement = await prisma.role.create({
    data: { name: "procurement", description: "Procurement — verifikasi pengadaan" },
  });
  await prisma.role.create({ data: { name: "user", description: "User — pengguna internal" } });
  await prisma.role.create({ data: { name: "mitra", description: "Mitra — pengguna eksternal" } });

  // ── Regions ────────────────────────────────────
  const regionBaliNusra = await prisma.region.create({ data: { name: "BALI NUSRA" } });
  const regionJatim = await prisma.region.create({ data: { name: "JATIM" } });
  const regionJatengDIY = await prisma.region.create({ data: { name: "JATENG DIY" } });

  // ── Branches ───────────────────────────────────
  const branchByRegion: Record<string, string[]> = {
    "BALI NUSRA": ["DENPASAR", "FLORES", "KUPANG", "MATARAM"],
    "JATIM": ["JEMBER", "LAMONGAN", "MADIUN", "MALANG", "SIDOARJO", "SURABAYA"],
    "JATENG DIY": ["MAGELANG", "PEKALONGAN", "PURWOKERTO", "SEMARANG", "SURAKARTA", "YOGYAKARTA"],
  };

  const regionMap = { "BALI NUSRA": regionBaliNusra.id, "JATIM": regionJatim.id, "JATENG DIY": regionJatengDIY.id };
  const allBranches: { name: string; regionId: string }[] = [];

  for (const [regionName, branches] of Object.entries(branchByRegion)) {
    for (const branchName of branches) {
      allBranches.push({ name: branchName, regionId: regionMap[regionName] });
    }
  }

  for (const b of allBranches) {
    await prisma.branch.create({ data: b });
  }

  // ── Users ──────────────────────────────────────
  const adminPassword = await bcrypt.hash("000000", 12);
  await prisma.user.create({
    data: {
      nik: "000000",
      name: "Super Admin",
      email: "admin@dompis.com",
      password: adminPassword,
      roleId: roleSuperadmin.id,
      status: "ACTIVE",
    },
  });

  const procurementPassword = await bcrypt.hash("000001", 12);
  const branchSurabaya = await prisma.branch.findFirst({ where: { name: "SURABAYA" } });
  await prisma.user.create({
    data: {
      nik: "000001",
      name: "Procurement User",
      email: "procurement@dompis.com",
      password: procurementPassword,
      roleId: roleProcurement.id,
      branchId: branchSurabaya?.id,
      regionId: regionJatim.id,
      status: "ACTIVE",
    },
  });

  console.log("✅ Seed completed");
  console.log("   Regions: BALI NUSRA, JATIM, JATENG DIY");
  console.log("   Branches: ", Object.values(branchByRegion).flat().join(", "));
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });