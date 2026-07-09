"use client";
import MasterCRUDPage, { FieldConfig } from "@/components/shared/MasterCRUDPage";

const fields: FieldConfig[] = [
  { key: "id", label: "ID", type: "text" },
  { key: "name", label: "Nama Region", type: "text", required: true, width: "200px" },
  { key: "code", label: "Kode", type: "text", width: "120px" },
  { key: "isActive", label: "Status", type: "boolean", width: "100px" },
];

export default function RegionPage() {
  return <MasterCRUDPage title="Region" entity="region" fields={fields} />;
}