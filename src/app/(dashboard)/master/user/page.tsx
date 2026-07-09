"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import DataTable from "@/components/shared/DataTable";
import { userSchema, type UserFormData } from "@/lib/validations";

export default function UserManagementPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [roles, setRoles] = useState<any[]>([]);
  const [regions, setRegions] = useState<any[]>([]);
  const [branches, setBranches] = useState<any[]>([]);
  const [mitras, setMitras] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<any>(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const form = useForm<UserFormData>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      nik: "",
      name: "",
      email: "",
      phone: "",
      roleId: "",
      regionId: "",
      branchId: "",
      mitraId: "",
      password: "",
      status: "ACTIVE",
    },
  });

  const roleId = form.watch("roleId");
  const regionId = form.watch("regionId");
  const selectedRole = roles.find((r) => r.id === roleId);
  const regionBranches = branches.filter((b) => b.regionId === regionId);

  useEffect(() => { fetchAll(); }, [search, page]);

  async function fetchAll() {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    const [uRes, rRes, regRes, bRes, mRes] = await Promise.all([
      fetch(`/api/master/user?search=${search}&page=${page}&limit=10`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch("/api/master/role?limit=100", { headers }),
      fetch("/api/master/region?limit=100", { headers }),
      fetch("/api/master/branch?limit=100", { headers }),
      fetch("/api/master/mitra?limit=100", { headers }),
    ]);

    const [uData, rData, regData, bData, mData] = await Promise.all([
      uRes.json(),
      rRes.json(),
      regRes.json(),
      bRes.json(),
      mRes.json(),
    ]);

    if (uData.success) setUsers(uData.data.items);
    if (rData.success) setRoles(rData.data.items);
    if (regData.success) setRegions(regData.data.items);
    if (bData.success) setBranches(bData.data.items);
    if (mData.success) setMitras(mData.data.items);
    setLoading(false);
  }

  function openCreate() {
    setEditUser(null);
    form.reset({
      nik: "",
      name: "",
      email: "",
      phone: "",
      roleId: "",
      regionId: "",
      branchId: "",
      mitraId: "",
      password: "",
      status: "ACTIVE",
    });
    setModalOpen(true);
  }

  function openEdit(user: any) {
    setEditUser(user);
    form.reset({
      nik: user.nik,
      name: user.name,
      email: user.email || "",
      phone: "",
      roleId: user.roleId,
      regionId: user.regionId || "",
      branchId: user.branchId || "",
      mitraId: user.mitraId || "",
      password: "",
      status: user.status,
    });
    setModalOpen(true);
  }

  async function handleSubmit(data: UserFormData) {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    const payload: any = {
      nik: data.nik,
      name: data.name,
      email: data.email || undefined,
      roleId: data.roleId,
      regionId: data.regionId || undefined,
      branchId: data.branchId || undefined,
      mitraId: data.mitraId || undefined,
      status: data.status,
    };

    if (data.password) payload.password = data.password;

    try {
      const res = editUser
        ? await fetch(`/api/master/user/${editUser.id}`, { method: "PUT", headers, body: JSON.stringify(payload) })
        : await fetch("/api/master/user", {
            method: "POST",
            headers,
            body: JSON.stringify({ ...payload, password: data.password || data.nik }),
          });

      const result = await res.json();
      if (result.success) {
        toast.success(editUser ? "User berhasil diperbarui" : "User berhasil dibuat");
        setModalOpen(false);
        fetchAll();
      } else {
        toast.error(result.error || "Gagal menyimpan user");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  }

  async function handleDelete() {
    if (!deleteId) return;
    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/master/user/${deleteId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        toast.success("User berhasil dihapus");
        fetchAll();
      } else {
        toast.error(data.error || "Gagal menghapus user");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
    setDeleteId(null);
  }

  const columns = [
    { key: "nik", label: "NIK", width: "120px" },
    { key: "name", label: "Nama", width: "200px" },
    {
      key: "email",
      label: "Email",
      width: "180px",
      render: (u: any) => u.email || "-",
    },
    {
      key: "roleId",
      label: "Role",
      width: "120px",
      render: (u: any) => (
        <Badge variant="secondary">{roles.find((r) => r.id === u.roleId)?.name || "-"}</Badge>
      ),
    },
    {
      key: "mitraId",
      label: "Mitra",
      width: "160px",
      render: (u: any) => mitras.find((m) => m.id === u.mitraId)?.name || "-",
    },
    {
      key: "status",
      label: "Status",
      width: "100px",
      render: (u: any) => (
        <Badge variant={u.status === "ACTIVE" ? "success" : "secondary"}>{u.status}</Badge>
      ),
    },
  ];

  const totalPages = Math.ceil(users.length / 10);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">User Management</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Tambah User
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari NIK atau nama..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={users.length}
        onPageChange={setPage}
        actions={(u) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(u)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setDeleteId(u.id)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <AlertDialog open={!!deleteId} onOpenChange={(o) => !o && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus User</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editUser ? "Edit User" : "Tambah User"}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>NIK *</Label>
                <Input {...form.register("nik")} />
                {form.formState.errors.nik && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.nik.message}</p>
                )}
              </div>
              <div>
                <Label>Nama *</Label>
                <Input {...form.register("name")} />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">{form.formState.errors.name.message}</p>
                )}
              </div>
            </div>

            <div>
              <Label>Email</Label>
              <Input type="email" {...form.register("email")} />
              {form.formState.errors.email && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <Controller
              name="roleId"
              control={form.control}
              render={({ field, fieldState }) => (
                <div>
                  <Combobox
                    label="Role"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={roles.map((r) => ({ value: r.id, label: r.name }))}
                    placeholder="Pilih Role"
                    required
                  />
                  {fieldState.error && (
                    <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                  )}
                </div>
              )}
            />

            {selectedRole?.name === "mitra" && (
              <Controller
                name="mitraId"
                control={form.control}
                render={({ field }) => (
                  <Combobox
                    label="Mitra"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={mitras.map((m) => ({ value: m.id, label: m.name }))}
                    placeholder="Pilih Mitra"
                    required
                  />
                )}
              />
            )}

            <div className="grid grid-cols-2 gap-4">
              <Controller
                name="regionId"
                control={form.control}
                render={({ field }) => (
                  <Combobox
                    label="Region"
                    value={field.value ?? ""}
                    onChange={(v) => { field.onChange(v); form.setValue("branchId", ""); }}
                    options={regions.map((r) => ({ value: r.id, label: r.name }))}
                    placeholder="Pilih Region (opsional)"
                  />
                )}
              />
              <Controller
                name="branchId"
                control={form.control}
                render={({ field }) => (
                  <Combobox
                    label="Branch"
                    value={field.value ?? ""}
                    onChange={field.onChange}
                    options={regionBranches.map((b) => ({ value: b.id, label: b.name }))}
                    placeholder="Pilih Branch (opsional)"
                  />
                )}
              />
            </div>

            <div>
              <Label>Password {editUser ? "(kosongkan jika tidak diubah)" : "*"}</Label>
              <Input type="password" {...form.register("password")} required={!editUser} />
            </div>

            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <Combobox
                  label="Status"
                  value={field.value ?? ""}
                  onChange={field.onChange}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                  ]}
                  placeholder="Pilih Status"
                />
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {editUser ? "Simpan" : "Buat User"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
