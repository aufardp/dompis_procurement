"use client";

import { useState, useEffect } from "react";
import { FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";

type DashboardStats = {
  totalBerkas: number;
  draft: number;
  pending: number;
  completed: number;
  rejected: number;
  recentBerkas: Array<{
    id: string;
    nomor: string;
    currentStage: string;
    approvalStatus: string;
    createdAt: string;
  }>;
};

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch("/api/dashboard/stats", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setStats(d.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="text-center py-12 text-gray-500">Memuat...</div>;

  const cards = [
    { label: "Total Berkas", value: stats?.totalBerkas ?? 0, icon: FileText, color: "bg-blue-50 text-blue-600" },
    { label: "Draft", value: stats?.draft ?? 0, icon: Clock, color: "bg-yellow-50 text-yellow-600" },
    { label: "Selesai", value: stats?.completed ?? 0, icon: CheckCircle, color: "bg-green-50 text-green-600" },
    { label: "Revisi", value: stats?.rejected ?? 0, icon: AlertTriangle, color: "bg-red-50 text-red-600" },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {cards.map((card) => (
          <div key={card.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500">{card.label}</p>
                <p className="text-3xl font-bold mt-1">{card.value}</p>
              </div>
              <div className={`p-3 rounded-lg ${card.color}`}>
                <card.icon className="w-6 h-6" />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h2 className="text-lg font-semibold mb-4">Berkas Terbaru</h2>
        {stats?.recentBerkas?.length ? (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200 text-left text-gray-500">
                  <th className="pb-3 font-medium">No. Berkas</th>
                  <th className="pb-3 font-medium">Stage</th>
                  <th className="pb-3 font-medium">Status</th>
                  <th className="pb-3 font-medium">Tanggal</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentBerkas.map((b) => (
                  <tr key={b.id} className="border-b border-gray-100">
                    <td className="py-3">{b.nomor}</td>
                    <td className="py-3">{b.currentStage}</td>
                    <td className="py-3">
                      <span
                        className="px-2 py-1 rounded-full text-xs font-medium text-white"
                        style={{
                          backgroundColor:
                            b.approvalStatus === "APPROVED" || b.approvalStatus === "COMPLETED"
                              ? "#10b981"
                              : b.approvalStatus === "REJECTED" || b.approvalStatus === "REVISION"
                              ? "#ef4444"
                              : "#C098D6",
                        }}
                      >
                        {b.approvalStatus}
                      </span>
                    </td>
                    <td className="py-3">{new Date(b.createdAt).toLocaleDateString("id-ID")}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-gray-400 text-center py-8">Belum ada data berkas</p>
        )}
      </div>
    </div>
  );
}