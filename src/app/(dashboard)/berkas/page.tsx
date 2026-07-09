"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Plus, Search, Filter } from "lucide-react";

export default function BerkasListPage() {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  async function fetchData() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({ page: String(page), limit: "10" });
    if (search) params.set("search", search);
    if (stage) params.set("stage", stage);

    const res = await fetch(`/api/berkas?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setItems(data.data.items);
      setTotalPages(data.data.totalPages);
      setTotal(data.data.total);
    }
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [page, stage]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    setPage(1);
    fetchData();
  }

  const stages = ["DRAFT", "REGIONAL", "PROCUREMENT", "FINANCE", "APM", "COMPLETED", "CANCELLED"];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Daftar Berkas</h1>
        <Link
          href="/berkas/create"
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition hover:opacity-90"
          style={{ backgroundColor: "#C098D6" }}
        >
          <Plus className="w-4 h-4" />
          Buat Berkas
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 mb-4">
        <form onSubmit={handleSearch} className="flex items-center gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="Cari nomor atau nama pekerjaan..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm"
            value={stage}
            onChange={(e) => { setStage(e.target.value); setPage(1); }}
          >
            <option value="">Semua Stage</option>
            {stages.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <button type="submit" className="px-4 py-2 bg-gray-100 rounded-lg text-sm font-medium hover:bg-gray-200">
            Cari
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Belum ada berkas</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 pt-3 px-4 font-medium">No. Berkas</th>
                <th className="pb-3 pt-3 px-4 font-medium">Nama Pekerjaan</th>
                <th className="pb-3 pt-3 px-4 font-medium">Nilai</th>
                <th className="pb-3 pt-3 px-4 font-medium">Stage</th>
                <th className="pb-3 pt-3 px-4 font-medium">Status</th>
                <th className="pb-3 pt-3 px-4 font-medium">Dibuat</th>
                <th className="pb-3 pt-3 px-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((b: any) => (
                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 font-medium">{b.nomor}</td>
                  <td className="py-3 px-4">{b.info?.namaPekerjaan || "-"}</td>
                  <td className="py-3 px-4">
                    {b.info?.nilaiPekerjaan
                      ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(b.info.nilaiPekerjaan))
                      : "-"}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: "#C098D6" }}>
                      {b.currentStage}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                      b.approvalStatus === "APPROVED" || b.approvalStatus === "COMPLETED" ? "bg-green-500" :
                      b.approvalStatus === "REJECTED" || b.approvalStatus === "REVISION" ? "bg-red-500" :
                      b.approvalStatus === "PENDING" ? "bg-yellow-500" : "bg-gray-400"
                    }`}>
                      {b.approvalStatus}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-500">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                  <td className="py-3 px-4">
                    <Link href={`/berkas/${b.id}`} className="text-primary-500 hover:underline text-xs">
                      Detail
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <span className="text-sm text-gray-500">Total: {total} berkas</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Prev</button>
              <span className="px-3 py-1 text-sm">{page} / {totalPages}</span>
              <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="px-3 py-1 text-sm border rounded-lg disabled:opacity-50">Next</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}