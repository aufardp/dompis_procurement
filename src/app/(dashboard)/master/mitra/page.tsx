"use client";
import MasterCRUDPage, { FieldConfig } from "@/components/shared/MasterCRUDPage";

const fields: FieldConfig[] = [
  { key: "id", label: "ID", type: "text", hidden: true, disabled: true },
  { key: "name", label: "Nama Mitra", type: "text", required: true, width: "200px" },
  { key: "code", label: "Kode", type: "text", width: "120px" },
  { key: "address", label: "Alamat", type: "textarea", width: "250px" },
  { key: "phone", label: "Telepon", type: "text", width: "140px" },
  { key: "email", label: "Email", type: "text", width: "180px" },
  { key: "pic", label: "PIC", type: "text", width: "160px" },
  { key: "isActive", label: "Status", type: "boolean", width: "100px" },
];

export default function MitraPage() {
  return <MasterCRUDPage title="Mitra" entity="mitra" fields={fields} />;
}