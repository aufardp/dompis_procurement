import { z } from "zod"
import type { FieldConfig } from "@/components/shared/MasterCRUDPage"

export function buildSchema(fields: FieldConfig[]) {
  const shape: Record<string, z.ZodTypeAny> = {}
  for (const field of fields) {
    if (field.hidden) continue

    switch (field.type) {
      case "boolean":
        shape[field.key] = z.boolean()
        break
      case "number":
        shape[field.key] = field.required
          ? z.coerce.number({ message: "Harus angka" })
          : z.coerce.number({ message: "Harus angka" }).optional().or(z.literal(""))
        break
      case "select":
        shape[field.key] = field.required
          ? z.string().min(1, "Wajib diisi")
          : z.string().optional().or(z.literal(""))
        break
      case "textarea":
        shape[field.key] = field.required
          ? z.string().min(1, "Wajib diisi")
          : z.string().optional().or(z.literal(""))
        break
      default:
        shape[field.key] = field.required
          ? z.string().min(1, "Wajib diisi")
          : z.string().optional().or(z.literal(""))
        break
    }
  }
  return z.object(shape)
}

export const userSchema = z.object({
  nik: z.string().min(1, "NIK wajib diisi"),
  name: z.string().min(1, "Nama wajib diisi"),
  email: z.string().email("Email tidak valid").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  roleId: z.string().min(1, "Role wajib dipilih"),
  regionId: z.string().optional().or(z.literal("")),
  branchId: z.string().optional().or(z.literal("")),
  mitraId: z.string().optional().or(z.literal("")),
  password: z.string().optional().or(z.literal("")),
  status: z.enum(["ACTIVE", "INACTIVE"]),
})

export type UserFormData = z.infer<typeof userSchema>
