"use client";
import MasterCRUDPage, { FieldConfig } from "@/components/shared/MasterCRUDPage";

const stageOptions = [
  { value: "PENGAJUAN", label: "Pengajuan" },
  { value: "VERIFIKASI_ADMIN", label: "Verifikasi Admin" },
  { value: "VERIFIKASI_MITRA", label: "Verifikasi Mitra" },
  { value: "VERIFIKASI_PP", label: "Verifikasi PP" },
  { value: "APPROVAL_KASUBAG", label: "Approval Kasubag" },
  { value: "APPROVAL_KABAG", label: "Approval Kabag" },
  { value: "APPROVAL_WADIR_1", label: "Approval Wadir 1" },
  { value: "APPROVAL_WADIR_2", label: "Approval Wadir 2" },
  { value: "APPROVAL_DIRUT", label: "Approval Dirut" },
  { value: "APPROVAL_SEKRETARIS", label: "Approval Sekretaris" },
  { value: "APPROVAL_BENDAHARA", label: "Approval Bendahara" },
  { value: "SELESAI", label: "Selesai" },
  { value: "REJECTED", label: "Ditolak" },
];

const fields: FieldConfig[] = [
  { key: "id", label: "ID", type: "text", hidden: true, disabled: true },
  { key: "name", label: "Nama Posisi", type: "text", required: true, width: "180px" },
  { key: "code", label: "Kode", type: "text", width: "100px" },
  { key: "stage", label: "Stage", type: "select", required: true, options: stageOptions, width: "160px" },
  { key: "orderNo", label: "Urutan", type: "number", width: "80px" },
  { key: "hexColor", label: "Warna", type: "text", width: "100px" },
  { key: "slaDays", label: "SLA (Hari)", type: "number", width: "100px" },
  { key: "icon", label: "Icon", type: "text", width: "100px" },
  { key: "isActive", label: "Status", type: "boolean", width: "100px" },
];

export default function PosisiPage() {
  return <MasterCRUDPage title="Posisi" entity="posisi" fields={fields} />;
}