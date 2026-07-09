import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // ── Roles ──────────────────────────────────────
  const roleSuperadmin = await prisma.role.upsert({
    where: { name: "superadmin" },
    update: { description: "Super Administrator — akses penuh" },
    create: { name: "superadmin", description: "Super Administrator — akses penuh" },
  });
  const roleProcurement = await prisma.role.upsert({
    where: { name: "procurement" },
    update: { description: "Procurement — verifikasi pengadaan" },
    create: { name: "procurement", description: "Procurement — verifikasi pengadaan" },
  });
  await prisma.role.upsert({
    where: { name: "user" },
    update: { description: "User — pengguna internal" },
    create: { name: "user", description: "User — pengguna internal" },
  });
  await prisma.role.upsert({
    where: { name: "mitra" },
    update: { description: "Mitra — pengguna eksternal" },
    create: { name: "mitra", description: "Mitra — pengguna eksternal" },
  });

  // ── Regions ────────────────────────────────────
  const regionBaliNusra = await prisma.region.upsert({
    where: { name: "BALI NUSRA" },
    update: {},
    create: { name: "BALI NUSRA" },
  });
  const regionJatim = await prisma.region.upsert({
    where: { name: "JATIM" },
    update: {},
    create: { name: "JATIM" },
  });
  const regionJatengDIY = await prisma.region.upsert({
    where: { name: "JATENG DIY" },
    update: {},
    create: { name: "JATENG DIY" },
  });

  // ── Branches ───────────────────────────────────
  const branchByRegion: Record<string, string[]> = {
    "BALI NUSRA": ["DENPASAR", "FLORES", "KUPANG", "MATARAM"],
    "JATIM": ["JEMBER", "LAMONGAN", "MADIUN", "MALANG", "SIDOARJO", "SURABAYA"],
    "JATENG DIY": ["MAGELANG", "PEKALONGAN", "PURWOKERTO", "SEMARANG", "SURAKARTA", "YOGYAKARTA"],
  };

  const regionMap: Record<string, string> = {
    "BALI NUSRA": regionBaliNusra.id,
    "JATIM": regionJatim.id,
    "JATENG DIY": regionJatengDIY.id,
  };

  for (const [regionName, branches] of Object.entries(branchByRegion)) {
    for (const branchName of branches) {
      await prisma.branch.upsert({
        where: { name: branchName },
        update: { regionId: regionMap[regionName] },
        create: { name: branchName, regionId: regionMap[regionName] },
      });
    }
  }

  // ── Users ──────────────────────────────────────
  const adminPassword = await bcrypt.hash("000000", 12);
  await prisma.user.upsert({
    where: { nik: "000000" },
    update: { name: "Super Admin", email: "admin@dompis.com", password: adminPassword, roleId: roleSuperadmin.id, status: "ACTIVE" },
    create: { nik: "000000", name: "Super Admin", email: "admin@dompis.com", password: adminPassword, roleId: roleSuperadmin.id, status: "ACTIVE" },
  });

  const procurementPassword = await bcrypt.hash("000001", 12);
  const branchSurabaya = await prisma.branch.findFirst({ where: { name: "SURABAYA" } });
  await prisma.user.upsert({
    where: { nik: "000001" },
    update: { name: "Procurement User", email: "procurement@dompis.com", password: procurementPassword, roleId: roleProcurement.id, branchId: branchSurabaya?.id, regionId: regionJatim.id, status: "ACTIVE" },
    create: { nik: "000001", name: "Procurement User", email: "procurement@dompis.com", password: procurementPassword, roleId: roleProcurement.id, branchId: branchSurabaya?.id, regionId: regionJatim.id, status: "ACTIVE" },
  });

  // ── Mitra (sample) ────────────────────────────
  const mitraContoh = await prisma.mitra.upsert({
    where: { name: "MITRA CONTOH" },
    update: {},
    create: { name: "MITRA CONTOH", code: "MC001", phone: "021-12345678", pic: "John Doe" },
  });

  // ── User Mitra ─────────────────────────────────
  const roleMitra = await prisma.role.findUnique({ where: { name: "mitra" } });
  if (roleMitra) {
    const mitraPassword = await bcrypt.hash("000002", 12);
    await prisma.user.upsert({
      where: { nik: "000002" },
      update: { name: "User Mitra", email: "mitra@dompis.com", password: mitraPassword, roleId: roleMitra.id, mitraId: mitraContoh.id, status: "ACTIVE" },
      create: { nik: "000002", name: "User Mitra", email: "mitra@dompis.com", password: mitraPassword, roleId: roleMitra.id, mitraId: mitraContoh.id, status: "ACTIVE" },
    });
  }

  // ── Programs ───────────────────────────────────
  const programs = [
    "ACCESS", "APC", "CONSUMER", "EKSPEDISI", "FEEDER", "FTTH",
    "GRANULAR", "HSI", "JPP", "KONSTRUKSI EKSTERNAL", "LME HEM",
    "MAINTENANCE", "MICRODEMAND", "MITRATEL", "NODE B", "NODE B OLO",
    "NON SEKTOR CLOSING", "NON SEKTOR UM", "PEKERJAAN TAMBAHAN",
    "PELOLOSAN", "PENGADAAN", "PSB EBIZ", "PT 2", "PT 3",
    "PT2 SIMPLE", "RECOVERY", "RELOKASI", "RESILIENCY", "RIFO",
    "SEKTOR CLOSING", "SEKTOR UM", "SEWA", "SPBU", "SPKL LEMBUR",
    "STTF", "SURVEY MICRODEMAND", "TCLOUD", "UTILITAS", "WASMAN",
  ];

  for (const name of programs) {
    await prisma.program.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ── Jenis Pekerjaan ────────────────────────────
  const jenisPekerjaan = [
    "IOAN", "KELOLA NTE", "KONSTRUKSI", "MAINTENANCE",
    "PROVISIONING", "SURVEI MD",
  ];

  for (const name of jenisPekerjaan) {
    await prisma.jenisPekerjaan.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  // ── Mitra (all) ────────────────────────────────
  const mitraNames = [
    "ABADI NUSANTARA TEKNIK", "ABIMANYU PUTRA PRATAMA", "ADHI KARYA KOMUNIKA",
    "ADHI MITRA TEKNIK UTAMA", "ADHITAMA GANIA SEJAHTERA", "AGUS JAYA TEKNIK",
    "AINIYAH INDOMITRA SEJAHTERA", "AIR BOX PERSONALIA", "AKSES KWALITAS UNGGUL",
    "ALFAZZA BERKAH BERSAMA", "ANANDA KARYA NUGRAHA", "ANDALAN PRATAMA INDONUSA",
    "ANDINA MANABA GRUP", "ANHAKO SEJAHTERA ABADI", "ANSIKA JITAMA TEKNIK",
    "ANUGERAH SETIA PERSADA", "ANUGRAH BORNEO NUSANTARA", "APPATUNRU CHANDRA ERLANGGA",
    "ARUNA DARMA NUSANTARA", "BALI INSAN PERKASA", "BALI SARI REJEKI",
    "BANGTELINDO", "BANGUN JAYA OPTIMA", "BASUDEWA EKAKARSA ANARGYA RAYNOR SADAJIWA",
    "BERCA JAYA KOMUNIKA", "BERKAH BANYU SUCI", "BERKAH SERIKAT MANDIRI",
    "BIJAK SUKSES UTAMA", "BIMASAKTI RAJA NUSANTARA", "BINTANG ANUGERAH JAYASRI ABADI",
    "BORSYA CIPTA COMMUNICA", "BRYLIAN BISNIS CENTER", "CAMAR ERA MANDIRI",
    "CANGKOK KEMBANG WIJOYO KUSUMO", "CATU BUANA PRIMA", "CENTRALINDO PANCA SAKTI",
    "CIPTA AKSES INDOTAMA", "CIPTA INDOTEK PRATAMA", "CIPTA UTAMA KARYA",
    "CITRA ADIKARYA MANDIRI", "CITRA DELTA MAKMUR", "CITRA TELINTI MULIA",
    "CITRA TIDAR MANDIRI", "DASYAT ABADI JAYA", "DATA MITRA TIDAK ADA",
    "DAYA MITRA KAUSAR", "DHARMA AKSES NUSANTARA", "DHARMA KUMALA UTAMA",
    "DHELTA SUMBER TEKNIK", "DIAN KARYA", "DIBYACIPTA PRIMASOL",
    "DIO PRATAMA", "DUTA ANUGRAH DAMAI SEJAHTERA", "DUTA JAYA TEKNIK",
    "DUTA SELARAS SOLUSINDO", "DWIBARAT TANGGUH SETIA", "EKSAKTA SINERGI INDONESIA",
    "EL-KOKAR TIMUR", "FAJAR MITRA KRIDA ABADI", "FANTASIRU FIL ARDHI",
    "FIBERHOME TECHNOLOGIES INDONESIA", "GAGAS MITRA JAYA", "GALANG BANGUN UTAMA",
    "GALFA REDJA INSANI", "GAMMA INFORMATIKA KOMUNIKASI", "GARINDO TECHNO MANDIRI",
    "GARUDA LINTAS NUSA", "GARUDA MITRA SOLUSI", "GARUDA TELEKOMUNIKASI INDONESIA",
    "GAYA MASA TEKNIKA", "GEMILANG FIN BERSAMA", "GIRI KENCANA BOGOR",
    "GLOBAL VISINDO", "GLOBALINDO LINTAS SELARAS", "GRAHA SARANA DUTA",
    "GRAND PRINCIPAL MANDIRI", "GRIYO ASRI 21", "GUNA SINERGI TECHNOLOGIES",
    "HABLUN CITRAMAS PERSADA", "HARITA", "HIKARI NAIPAR JAYA INDONESIA",
    "IJEN MULTI SOLUSI", "INANDA INDAH", "INCONIS NUSA JAYA",
    "INDO MULYA", "INFOMEDIA NUSANTARA", "INFORMASI CITRA CARAKA",
    "INFRACOM BETANIA UNGGUL", "INTAN DAYA MANDIRI", "JEMBAR SEJAHTERA",
    "KARL WIG ABADI", "KARYA ARI MANDIRI", "KARYA PRIMA PUTRATEL",
    "KARYA GIRI PERMASSIVE", "KECUBUNG BORNEO KHATULISTIWA", "KENCANA RAYA INDONESIA",
    "KODITEL SWASTA MANDIRI", "KOMUNIKA UTAMA", "KOPEGTEL CILACAP",
    "KOPEGTEL JOMBANG", "KOPEGTEL MLIWIS BOJONEGORO", "KOPEGTEL PEKALONGAN",
    "KOPEGTEL PONOROGO", "KOPERASI JASA KARYAWAN INTERN TELKOM AKSES",
    "KOPERASI JASA PEGAWAI PERUMTEL KUDUS", "KOPERASI JASA PEGAWAI TELKOM CAMAR JEMBER",
    "KOPERASI JASA PEGAWAI TELKOM MAHARANI", "KOPERASI JASA WASKITA",
    "KOPERASI KARYAWAN PERUSAHAAN PERSEROAN (PERSERO) PT. TELEKOMUNIKASI INDONESIA SEMARANG (KOPEGTEL SEMARANG)",
    "KOPERASI KARYAWAN SMART MEDIA",
    "KOPERASI KONSUMEN BUMN KOPEGTEL KANDATEL SURABAYA BARAT",
    "KOPERASI KONSUMEN PEGAWAI TELEKOMUNIKASI INDONESIA SEDUDO",
    "KOPERASI KONSUMEN PEGAWAI TELEKOMUNIKASI MANDIRI KABUPATEN TULUNGAGUNG",
    "KOPERASI KONSUMEN PEGAWAI TELKOM", "KOPERASI KONSUMEN PEGAWAI TELKOM BANYUWANGI",
    "KOPERASI PEGAWAI TELEKOMUNIKASI INDONESIA MALANG", "KOPERASI PEGAWAI TELEKOMUNIKASI PALAPA",
    "KOPERASI PEGAWAI TELKOM AKSES SEJAHTERA", "KOPERASI PEGAWAI TELKOM NGAWI",
    "KOPERASI PEGAWAI TELKOM SOLO", "KOPKAR CITRA BEKISAR",
    "LENTERA ANDALAN KOMUNIKASI", "LINTAS ERA DIGITAL", "LIZA CITRA SANJAYA",
    "LUMINTU", "MADIUN AKSES TELEKOMUNIKASI", "MAHARDHIKA KARYA NUGRAHA",
    "MAJU JAYA TEKNOLOGI", "MAKMUR BERSAMA SEJAHTERA", "MAPAN BERKAH SEJAHTERA",
    "MAREJANI", "MEDIATAMA AKSES GLOBAL", "MEGA CREATIVE PROMOSINDO",
    "MENARA NUSA ABADI", "MITRA AKSES SOLUSINDO", "MITRA AKSES SUROPATI",
    "MITRA KENCANA TECHNOLOGY", "MITRA TEKNIK FLOBAMOR", "MITRA TELECOM GLOBAL MANDIRI",
    "MITRAKOM MANDIRI JOGJA", "MOLUCCAS MITRA MANDIRI", "MUAMALAT INDAH LESTARI",
    "MUFTI SARANA SUPLINDO", "MULTI MEDIATEL TECHNOLOGIES", "MULTIUSER GLOBAL NETWORK",
    "MURIA PERKASA UTAMA", "MUSTIKA BINA SOLUSION", "NATA JAYA ELEKTRO",
    "NATAJARING AKSES LOKAL", "NUTEL MAKMUR TELEKOMUNIKASI", "OPMC INDONESIA",
    "PANCA JAYA KOMUNIKA", "PARTNER PROPERTI", "PAS ADITAMA",
    "PASIR JAYA SEPULUH", "PEGAWAI TELKOM PROBOLINGGO(PTP)", "PEMUDA ANUGRAH BANGSA",
    "PENTA GLOBAL TECHNOLOGY", "PERINTIS INDONUSA KARYA", "PILIH UTAMA",
    "PRABAKARA USAHATAMA", "PRAGATA MAKMUR PERSADA", "PRANATA PRIMA TAMA",
    "PRASETIA DWIDHARMA", "PRAWIRA JAYA KAHUTAMA", "PRIMA AKSES SOLUSI GLOBAL",
    "PRIMA ANUGERAH SANTOSO", "PRIMARINDO SUKSES MANDIRI", "PROLAB SUKSES BERSAMA",
    "PURNA JAWARA SURABAYA", "PUTERATEL ANDALAN SUKSES", "PUTRA BISTEL SOLUSINDO",
    "PUTRA JAYA MANDIRI ABADI", "PUTRA JAYA RAHARJA", "PUTRA LANGGENG GUMELAR",
    "RAFI JAYA BROTHER", "RAHARJA PRAKARSA NUSANTARA", "RAJA AMERTHA DEWATA",
    "RAJA SAKTI INDONESIA", "RAJAWALI ANUGRAH RESOURCES", "RAJAWALI RAYA INDONESIA",
    "RAYA KOMUNIKASI INDONESIA", "RAYADAZA SEJAHTERA BERSAMA", "REXOM INDO JAYA",
    "RIA BERKAH BERSAMA", "RIA KUSUMAH BERSAMA", "RIDHO MAKMUR SENTOSA",
    "RIFO CIPTA MANDIRI", "SABA PRATAMA", "SANDHY PUTRA MAKMUR",
    "SAPTA CAHAYA SENTOSA", "SAPUTRA GLOBAL NUSANTARA", "SARANA ARTHA LESTARI",
    "SARANA MITRA PERSADA", "SARANA PRIMA SOLUSI INDONESIA", "SEDAYU CAHAYA PERKASA",
    "SEGI TIGAMUTIARA", "SEMERU AGUNG MANDIRI", "SENTRA ENERGI TEKNIK KOMUNIKASI",
    "SIDO AGUNG MANDIRI", "SINAR AKSES ABADI", "SINERGI INDO PRATAMA PERKASA",
    "SINERGI JOMBANG PATRIOT", "SINGA SURYA PERDANA", "SISCOM TECHNOLOGIES",
    "SMARTELCO SOLUSI TEKNOLOGI", "SOLUSI KONEKTIVITAS DIGITAL", "SUBA LABDA GATRA",
    "SUMBER TEHNIK NUSANTARA", "SURYA BRATA", "SURYA KONSTRUKSINDO UTAMA",
    "SURYA MENTARI JAYA", "SURYA PERKASA ABADI TEKNIK", "SWADESI CIPTA MANDIRI",
    "SWARNA JAVADWIPA UTAMA", "TALOBAT MARHIMPU TUA", "TAPAN MAS",
    "TATA BERLIAN NUSANTARA", "TECHNOLOGY KARYA MANDIRI", "TELKOM AKSES",
    "TITIPAN ANTAR NUSA LOGISTICS", "TOTAL LINTAS SAMUDRA", "TRANS ARTHA TECHNOLOGY NUSANTARA",
    "TRI BUMI ASIH", "TRI TELCON UTAMA", "TRIENDO UTAMA",
    "TRIJAYA SENTRA UTAMA", "TRIPOLA PANATA", "TRIPUTRA ANDALAN",
    "TURTIM PRIMAKOM SENTOSA", "UNGGUL BRATA", "UNGGUL EJAWANTAH INDUSTRI",
    "UPAYA TEHNIK", "UTAMA AKSES PRIMA", "VAN DYDAR KUSUMA SAKTI",
    "WAHANA ERA SEJAHTERA", "WAHANA MULTI LOGISTIK", "WAHANA SOLUSI MANDIRI",
    "WIJAYA KARYA BANGUNAN GEDUNG", "WINATA PERKASA MAKMUR", "WIRA SURYA MANDIRI",
    "WREDATAMA MITRA TELEMATIKA", "YOFC INTERNATIONAL INDONESIA",
  ];

  for (const name of mitraNames) {
    await prisma.mitra.upsert({
      where: { name },
      update: {},
      create: { name },
    });
  }

  console.log("✅ Seed completed");
  console.log(`   ${programs.length} programs`);
  console.log(`   ${jenisPekerjaan.length} jenis pekerjaan`);
  console.log(`   ${mitraNames.length} mitras`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
