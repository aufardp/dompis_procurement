"use client";
import MasterCRUDPage, { FieldConfig } from "@/components/shared/MasterCRUDPage";

const fields: FieldConfig[] = [
  { key: "id", label: "ID", type: "text", hidden: true, disabled: true },
  { key: "name", label: "Nama Jenis Pekerjaan", type: "text", required: true, width: "250px" },
  { key: "code", label: "Kode", type: "text", width: "120px" },
  { key: "isActive", label: "Status", type: "boolean", width: "100px" },
];

export default function JenisPekerjaanPage() {
  return <MasterCRUDPage title="Jenis Pekerjaan" entity="jenis-pekerjaan" fields={fields} />;
}