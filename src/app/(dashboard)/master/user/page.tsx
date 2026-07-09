"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, X, Search } from "lucide-react";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [search, setSearch] = useState("");

  const [form, setForm] = useState({
    nik: "",
    name: "",
    email: "",
    phone: "",
    roleId: "",
    regionId: "",
    branchId: "",
    password: "",
    status: "ACTIVE" as string,
  });

  useEffect(() => { fetchAll(); }, []);

  async function fetchAll() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [uRes, rRes, regRes, bRes] = await Promise.all([
      fetch("/api/master/user?limit=100", { headers }),
      fetch("/api/master/role?limit=100", { headers }),
      fetch("/api/master/region?limit=100", { headers }),
      fetch("/api/master/branch?limit=100", { headers }),
    ]);

    const uData = await uRes.json();
    const rData = await rRes.json();
    const regData = await regRes.json();
    const bData = await bRes.json();

    if (uData.success) setUsers(uData.data.items);
    if (rData.success) setRoles(rData.data.items);
    if (regData.success) setRegions(regData.data.items);
    if (bData.success) setBranches(bData.data.items);
    setLoading(false);
  }

  function openCreate() {
    setEditUser(null);
    setForm({ nik: "", name: "", email: "", phone: "", password: "", roleId: "", regionId: "", branchId: "", status: "ACTIVE" });
    setModalOpen(true);
  }

  function openEdit(user: any) {
    setEditUser(user);
    setForm({
      nik: user.nik,
      name: user.name,
      email: user.email || "",
      phone: "",
      password: "",
      roleId: user.roleId,
      regionId: user.regionId || "",
      branchId: user.branchId || "",
      status: user.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const payload: any = {
      nik: form.nik,
      name: form.name,
      email: form.email || undefined,
      roleId: form.roleId,
      regionId: form.regionId || undefined,
      branchId: form.branchId || undefined,
      status: form.status,
    };

    if (form.password) payload.password = form.password;

    if (editUser) {
      await fetch(`/api/master/user/${editUser.id}`, {
        method: "PUT",
        headers,
        body: JSON.stringify(payload),
      });
    } else {
      await fetch("/api/master/user", {
        method: "POST",
        headers,
        body: JSON.stringify({ ...payload, password: form.password || form.nik }),
      });
    }

    setModalOpen(false);
    fetchAll();
  }

  async function handleDelete(id: string) {
    if (!confirm("Hapus user ini?")) return;
    const token = localStorage.getItem("token");
    await fetch(`/api/master/user/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    fetchAll();
  }

  const regionBranches = branches.filter((b) => b.regionId === form.regionId);
  const filteredUsers = users.filter((u) =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.nik?.includes(search)
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <button
          onClick={openCreate}
          className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium"
          style={{ backgroundColor: "#C098D6" }}
        >
          <Plus className="w-4 h-4" /> Tambah User
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <input
          className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
          placeholder="Cari NIK atau nama..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-gray-500">Memuat...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-12 text-center text-gray-400">Belum ada user</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 text-left text-gray-500">
                <th className="pb-3 pt-3 px-4 font-medium">NIK</th>
                <th className="pb-3 pt-3 px-4 font-medium">Nama</th>
                <th className="pb-3 pt-3 px-4 font-medium">Email</th>
                <th className="pb-3 pt-3 px-4 font-medium">Role</th>
                <th className="pb-3 pt-3 px-4 font-medium">Branch</th>
                <th className="pb-3 pt-3 px-4 font-medium">Region</th>
                <th className="pb-3 pt-3 px-4 font-medium">Status</th>
                <th className="pb-3 pt-3 px-4 font-medium">Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u: any) => {
                const role = roles.find((r) => r.id === u.roleId);
                const branch = branches.find((b) => b.id === u.branchId);
                const region = regions.find((r) => r.id === u.regionId);
                return (
                  <tr key={u.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4 font-medium">{u.nik}</td>
                    <td className="py-3 px-4">{u.name}</td>
                    <td className="py-3 px-4 text-gray-500">{u.email || "-"}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-1 rounded-full text-xs font-medium bg-primary-50 text-primary-700">
                        {role?.name || "-"}
                      </span>
                    </td>
                    <td className="py-3 px-4">{branch?.name || "-"}</td>
                    <td className="py-3 px-4">{region?.name || "-"}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${u.status === "ACTIVE" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                        {u.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex gap-2">
                        <button onClick={() => openEdit(u)} className="p-1 hover:bg-gray-100 rounded">
                          <Pencil className="w-4 h-4 text-blue-500" />
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1 hover:bg-gray-100 rounded">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-lg w-full max-w-lg p-6">
            <h2 className="text-lg font-bold mb-4">{editUser ? "Edit User" : "Tambah User"}</h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">NIK *</label>
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    value={form.nik}
                    onChange={(e) => setForm({ ...form, nik: e.target.value })}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Nama *</label>
                  <input
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Role *</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={form.roleId}
                  onChange={(e) => setForm({ ...form, roleId: e.target.value })}
                  required
                >
                  <option value="">Pilih Role</option>
                  {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Region</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    value={form.regionId}
                    onChange={(e) => {
                      setForm({ ...form, regionId: e.target.value, branchId: "" });
                    }}
                  >
                    <option value="">Pilih Region</option>
                    {regions.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Branch</label>
                  <select
                    className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                    value={form.branchId}
                    onChange={(e) => setForm({ ...form, branchId: e.target.value })}
                  >
                    <option value="">Pilih Branch</option>
                    {regionBranches.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Password {editUser ? "(kosongkan jika tidak diubah)" : "*"}
                </label>
                <input
                  type="password"
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  {...(!editUser ? { required: true } : {})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Status</label>
                <select
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-300"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm">
                  Batal
                </button>
                <button type="submit" className="px-4 py-2 text-white rounded-lg text-sm font-medium" style={{ backgroundColor: "#C098D6" }}>
                  {editUser ? "Simpan" : "Buat User"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}