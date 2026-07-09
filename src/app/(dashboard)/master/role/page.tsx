"use client";

import MasterCRUDPage, { FieldConfig } from "@/components/shared/MasterCRUDPage";

const fields: FieldConfig[] = [
  { key: "id", label: "ID", type: "text", hidden: true, disabled: true },
  { key: "name", label: "Nama Role", type: "text", required: true, width: "180px" },
  { key: "description", label: "Deskripsi", type: "textarea", width: "300px" },
  { key: "isActive", label: "Status", type: "boolean", width: "100px" },
];

export default function RolePage() {
  return <MasterCRUDPage title="Role" entity="role" fields={fields} />;
}