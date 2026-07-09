"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function TrackingPage() {
  const [search, setSearch] = useState("");
  const [berkas, setBerkas] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/berkas/${search}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const d = await res.json();
    setBerkas(d.success ? d.data : null);
    setLoading(false);
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Tracking Berkas</h1>

      <form onSubmit={handleSearch} className="flex gap-3 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
            placeholder="Masukkan nomor berkas..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: "#C098D6" }}>
          Cari
        </button>
      </form>

      {loading && <p className="text-gray-500">Mencari...</p>}

      {berkas === null && !loading && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center text-gray-400">
          Masukkan nomor berkas untuk melacak status
        </div>
      )}

      {berkas && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold">{berkas.nomor}</h2>
              <p className="text-sm text-gray-500">{berkas.info?.namaPekerjaan}</p>
            </div>
            <div className="flex gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: "#C098D6" }}>
                {berkas.currentStage}
              </span>
              <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
                berkas.approvalStatus === "COMPLETED" ? "bg-green-500" :
                berkas.approvalStatus === "REJECTED" ? "bg-red-500" : "bg-yellow-500"
              }`}>
                {berkas.approvalStatus}
              </span>
            </div>
          </div>

          <h3 className="text-sm font-medium mb-3">Riwayat Tracking</h3>
          <div className="space-y-3">
            {berkas.tracking?.map((t: any, i: number) => (
              <div key={t.id} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: "#C098D6" }} />
                  {i < berkas.tracking.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{t.action}</p>
                  <p className="text-xs text-gray-500">
                    {t.fromStage} → {t.toStage} | {t.createdBy?.name} | {new Date(t.createdAt).toLocaleString("id-ID")}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}