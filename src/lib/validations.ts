import { z } from "zod";

export const loginSchema = z.object({
  nik: z.string().min(1, "NIK wajib diisi"),
  password: z.string().min(1, "Password wajib diisi"),
});

export const createBerkasSchema = z.object({
  nomor: z.string().min(1),
  currentStage: z.enum(["DRAFT", "REGIONAL", "PROCUREMENT", "FINANCE", "APM", "COMPLETED", "CANCELLED"]),
  currentPosisiId: z.string().uuid(),
});

export const updateBerkasSchema = createBerkasSchema.partial();
