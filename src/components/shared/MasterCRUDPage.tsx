"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search, X } from "lucide-react";

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "boolean";
  required?: boolean;
  options?: { value: string; label: string }[];
  width?: string;
};

type Props = {
  title: string;
  entity: string;
  fields: FieldConfig[];
  fetchOptions?: Record<string, { label: string; options: { value: string; label: string }[] }>;
};

export default function MasterCRUDPage({ title, entity, fields }: Props) {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);
  const [form, setForm] = useState<Record<string, any>>({});

  useEffect(() => { fetchData(); }, [entity, search]);

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

  function openCreate() {
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "boolean") initial[f.key] = true;
      else if (f.type === "select" && f.options?.length) initial[f.key] = f.options[0].value;
      else initial[f.key] = "";
    });
    setEditItem(null);
    setForm(initial);
    setModalOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    const initial: Record<string, any> = {};
    fields.forEach((f) => {
      initial[f.key] = item[f.key] ?? "";
    });
    setForm(initial);
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    if (editItem) {
      await fetch(`/api/master/${entity}/${editItem.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(form),
      });
    } else {
      await fetch(`/api/master/${entity}`, {
        method: "POST",
        headers,
        body: JSON.stringify(form),
      });
    }

    setModalOpen(false);
    fetchData();
  }

  async function handleDelete(id: string) {
    if (!confirm(`Hapus ${title} ini?`)) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/master/${entity}/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchData();
  }

  function renderCell(item: any, field: FieldConfig) {
    const val = item[field.key];
    if (field.type === "boolean") {
      return (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${val ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
          {val ? "Aktif" : "Nonaktif"}
        </span>
      );
    }
    if (field.key === "regionId" || field.key.endsWith("Id")) {
      return String(val ?? "-");
    }
    return String(val ?? "-");
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#C098D6" }}
        >
          <Plus className="w-4 h-4" /> Tambah {title}
        </button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="Cari..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
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
                {fields.filter(f => f.key !== "id").map((f) => (
                  <th key={f.key} className="pb-3 pt-3 px-4 font-medium" style={{ width: f.width }}>{f.label}</th>
                ))}
                <th className="pb-3 pt-3 px-4 font-medium w-24">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item: any) => (
                <tr key={item.id} className="border-b border-gray-100 hover:bg-gray-50">
                  {fields.filter(f => f.key !== "id").map((f) => (
                    <td key={f.key} className="py-3 px-4">{renderCell(item, f)}</td>
                  ))}
                  <td className="py-3 px-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(item)} className="p-1 hover:bg-gray-100 rounded">
                        <Pencil className="w-4 h-4 text-blue-500" />
                      </button>
                      <button onClick={() => handleDelete(item.id)} className="p-1 hover:bg-gray-100 rounded">
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">{editItem ? `Edit ${title}` : `Tambah ${title}`}</h2>
              <button onClick={() => setModalOpen(false)}><X className="w-5 h-5" /></button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {fields.map((field) => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-gray-700">{field.label}{field.required ? " *" : ""}</label>
                  {field.type === "select" ? (
                    <select
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      required={field.required}
                    >
                      {field.options?.map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                      ))}
                    </select>
                  ) : field.type === "textarea" ? (
                    <textarea
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                      required={field.required}
                    />
                  ) : field.type === "boolean" ? (
                    <select
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={form[field.key] ? "true" : "false"}
                      onChange={(e) => setForm({ ...form, [field.key]: e.target.value === "true" })}
                    >
                      <option value="true">Aktif</option>
                      <option value="false">Nonaktif</option>
                    </select>
                  ) : (
                    <input
                      type={field.type === "number" ? "number" : "text"}
                      className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                      value={form[field.key] ?? ""}
                      onChange={(e) => setForm({ ...form, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value })}
                      required={field.required}
                    />
                  )}
                </div>
              ))}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">Batal</button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: "#C098D6" }}>
                  {editItem ? "Simpan" : "Buat"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}