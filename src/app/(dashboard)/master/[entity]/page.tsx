"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Plus, Search } from "lucide-react";

const entityLabels: Record<string, string> = {
  role: "Role",
  user: "User",
  regional: "Regional",
  branch: "Branch",
  program: "Program",
  mitra: "Mitra",
  posisi: "Posisi",
  "jenis-pekerjaan": "Jenis Pekerjaan",
  "jenis-tagihan": "Jenis Tagihan",
  "workflow-config": "Workflow Config",
};

export default function MasterPage() {
  const params = useParams();
  const entity = params?.entity as string;
  const label = entityLabels[entity] || entity;

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  async function fetchData() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const res = await fetch(`/api/master/${entity}?search=${search}&limit=100`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setItems(data.data.items);
    setLoading(false);
  }

  useEffect(() => { fetchData(); }, [entity, search]);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Master {label}</h1>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              className="pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
              placeholder="Cari..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat...</div>
        ) : items.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Belum ada data</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                {Object.keys(items[0]).filter(k => !['id', 'password', 'createdAt', 'updatedAt', 'deletedAt'].includes(k)).map((key) => (
                  <th key={key} className="pb-3 pt-3 px-4 font-medium capitalize">{key.replace(/([A-Z])/g, ' $1')}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {Object.entries(item).filter(([k]) => !['id', 'password', 'createdAt', 'updatedAt', 'deletedAt'].includes(k)).map(([key, val]) => (
                    <td key={key} className="py-3 px-4">
                      {key === 'isActive' ? (
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${val ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {val ? 'Aktif' : 'Nonaktif'}
                        </span>
                      ) : String(val)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}