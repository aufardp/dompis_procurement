"use client";
import { useState, useEffect } from "react";
import MasterCRUDPage, { FieldConfig } from "@/components/shared/MasterCRUDPage";

const fields: FieldConfig[] = [
  { key: "id", label: "ID", type: "text", hidden: true, disabled: true },
  { key: "name", label: "Nama Branch", type: "text", required: true, width: "200px" },
  { key: "code", label: "Kode", type: "text", width: "120px" },
  { key: "regionId", label: "Region", type: "select", required: true, width: "200px", options: [] },
  { key: "isActive", label: "Status", type: "boolean", width: "100px" },
];

export default function BranchPage() {
  const [regionOptions, setRegionOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/master/region?limit=100", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) {
          setRegionOptions(d.data.items.map((reg: any) => ({ value: reg.id, label: reg.name })));
        }
      });
  }, []);

  const dynamicFields: FieldConfig[] = fields.map((f) => {
    if (f.key === "regionId") return { ...f, options: regionOptions };
    return f;
  });

  return <MasterCRUDPage title="Branch" entity="branch" fields={dynamicFields} />;
}