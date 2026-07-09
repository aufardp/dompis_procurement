"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Send, CheckCircle, XCircle, RotateCcw, MessageSquare, Paperclip } from "lucide-react";

type BerkasDetail = {
  id: string;
  nomor: string;
  currentStage: string;
  approvalStatus: string;
  info: any;
  procurement: any;
  regional: any;
  tracking: any[];
  comments: any[];
  attachments: any[];
  createdBy: { name: string; nik: string };
  createdAt: string;
};

export default function BerkasDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id as string;

  const [berkas, setBerkas] = useState<BerkasDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState("");
  const [activeTab, setActiveTab] = useState("info");

  useEffect(() => {
    const token = localStorage.getItem("token");
    fetch(`/api/berkas/${id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => { if (d.success) setBerkas(d.data); setLoading(false); });
  }, [id]);

  async function handleAction(action: string) {
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/berkas/${id}/${action}`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ note: comment }),
    });
    const data = await res.json();
    if (data.success) window.location.reload();
  }

  async function handleComment(e: React.FormEvent) {
    e.preventDefault();
    if (!comment.trim()) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/berkas/${id}/comments`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ message: comment }),
    });
    setComment("");
    window.location.reload();
  }

  if (loading) return <div className="text-center py-12 text-gray-500">Memuat...</div>;
  if (!berkas) return <div className="text-center py-12 text-gray-500">Berkas tidak ditemukan</div>;

  const tabs = [
    { key: "info", label: "Informasi" },
    { key: "procurement", label: "Procurement" },
    { key: "regional", label: "Regional" },
    { key: "tracking", label: "Tracking" },
    { key: "comments", label: `Komentar (${berkas.comments.length})` },
    { key: "attachments", label: `Lampiran (${berkas.attachments.length})` },
  ];

  return (
    <div>
      <button onClick={() => router.back()} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-4">
        <ArrowLeft className="w-4 h-4" /> Kembali
      </button>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">{berkas.nomor}</h1>
            <p className="text-gray-500 text-sm">Dibuat oleh {berkas.createdBy?.name} ({berkas.createdBy?.nik})</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: "#C098D6" }}>
              {berkas.currentStage}
            </span>
            <span className={`px-3 py-1 rounded-full text-xs font-medium text-white ${
              ["APPROVED","COMPLETED"].includes(berkas.approvalStatus) ? "bg-green-500" :
              ["REJECTED","REVISION"].includes(berkas.approvalStatus) ? "bg-red-500" :
              "bg-yellow-500"
            }`}>
              {berkas.approvalStatus}
            </span>
          </div>
        </div>

        <div className="flex gap-2">
          <button onClick={() => handleAction("submit")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg text-white" style={{ backgroundColor: "#C098D6" }}>
            <Send className="w-3 h-3" /> Submit
          </button>
          <button onClick={() => handleAction("approve")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-green-500 text-white">
            <CheckCircle className="w-3 h-3" /> Approve
          </button>
          <button onClick={() => handleAction("reject")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-red-500 text-white">
            <XCircle className="w-3 h-3" /> Reject
          </button>
          <button onClick={() => handleAction("return")} className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-yellow-500 text-white">
            <RotateCcw className="w-3 h-3" /> Return
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="border-b border-gray-200 flex">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`px-4 py-3 text-sm font-medium border-b-2 transition ${
                activeTab === tab.key ? "border-primary-300 text-primary-700" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-6">
          {activeTab === "info" && (
            <div className="grid grid-cols-2 gap-4">
              <Field label="Nama Pekerjaan" value={berkas.info?.namaPekerjaan} />
              <Field label="Nilai Pekerjaan" value={berkas.info?.nilaiPekerjaan ? new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(Number(berkas.info.nilaiPekerjaan)) : "-"} />
              <Field label="Dasar Permintaan" value={berkas.info?.dasarPermintaan} />
              <Field label="Program ID" value={berkas.info?.programId} />
              <Field label="Mitra ID" value={berkas.info?.mitraId} />
              <Field label="Branch ID" value={berkas.info?.branchId} />
              <Field label="Regional ID" value={berkas.info?.regionalId} />
              <Field label="Tanggal Dibuat" value={new Date(berkas.createdAt).toLocaleDateString("id-ID")} />
            </div>
          )}

          {activeTab === "tracking" && (
            <div className="space-y-4">
              {berkas.tracking.map((t: any, i: number) => (
                <div key={t.id} className="flex gap-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: "#C098D6" }} />
                    {i < berkas.tracking.length - 1 && <div className="w-0.5 flex-1 bg-gray-200" />}
                  </div>
                  <div className="flex-1 pb-4">
                    <p className="text-sm font-medium">{t.action} — {t.fromStage} → {t.toStage}</p>
                    <p className="text-xs text-gray-500">{t.createdBy?.name} • {new Date(t.createdAt).toLocaleString("id-ID")}</p>
                    {t.note && <p className="text-xs text-gray-600 mt-1">{t.note}</p>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "comments" && (
            <div>
              <form onSubmit={handleComment} className="flex gap-2 mb-4">
                <input
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  placeholder="Tulis komentar..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                />
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm" style={{ backgroundColor: "#C098D6" }}>
                  Kirim
                </button>
              </form>
              {berkas.comments.map((c: any) => (
                <div key={c.id} className="border-b border-gray-100 py-3">
                  <p className="text-sm">{c.message}</p>
                  <p className="text-xs text-gray-500 mt-1">{c.user?.name} • {new Date(c.createdAt).toLocaleString("id-ID")}</p>
                </div>
              ))}
            </div>
          )}

          {activeTab === "attachments" && (
            <div className="space-y-2">
              {berkas.attachments.map((a: any) => (
                <div key={a.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                  <Paperclip className="w-4 h-4 text-gray-400" />
                  <span className="text-sm">{a.originalName}</span>
                  <span className="text-xs text-gray-400">({(a.fileSize / 1024).toFixed(1)} KB)</span>
                </div>
              ))}
              {berkas.attachments.length === 0 && <p className="text-gray-400 text-sm">Belum ada lampiran</p>}
            </div>
          )}

          {(activeTab === "procurement" || activeTab === "regional") && (
            <div className="text-gray-400 text-center py-8">
              Data {activeTab} akan ditampilkan di sini
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <p className="text-xs text-gray-500">{label}</p>
      <p className="text-sm font-medium">{value || "-"}</p>
    </div>
  );
}