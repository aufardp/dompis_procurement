"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import { toast } from "sonner";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Combobox, type Option } from "@/components/ui/combobox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import DataTable, { type Column } from "@/components/shared/DataTable";
import { useConfirm } from "@/components/shared/ConfirmModal";
import { buildSchema } from "@/lib/validations";

export type FieldConfig = {
  key: string;
  label: string;
  type: "text" | "number" | "select" | "textarea" | "boolean";
  required?: boolean;
  disabled?: boolean;
  hidden?: boolean;
  options?: Option[];
  width?: string;
};

type Props = {
  title: string;
  entity: string;
  fields: FieldConfig[];
  limit?: number;
  schema?: z.ZodObject<any>;
};

export default function MasterCRUDPage({ title, entity, fields, limit = 10, schema }: Props) {
  const confirm = useConfirm();
  const [items, setItems] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [modalOpen, setModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any>(null);

  const formSchema = schema || buildSchema(fields);
  type FormData = z.infer<typeof formSchema>;

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {} as any,
  });

  const displayFields = fields.filter((f) => f.key !== "id");

  useEffect(() => {
    fetchData();
  }, [entity, search, page, sortBy, sortOrder]);

  async function fetchData() {
    setLoading(true);
    const token = localStorage.getItem("token");
    const params = new URLSearchParams({
      search,
      page: String(page),
      limit: String(limit),
      sortBy,
      sortOrder,
    });
    const res = await fetch(`/api/master/${entity}?${params}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) {
      setItems(data.data.items);
      setTotal(data.data.total);
      setTotalPages(data.data.totalPages);
    }
    setLoading(false);
  }

  function getDefaultValues(): any {
    const vals: any = {};
    fields.filter((f) => !f.hidden).forEach((f) => {
      if (f.type === "boolean") vals[f.key] = true;
      else if (f.type === "select" && f.options?.length) vals[f.key] = f.options[0].value;
      else vals[f.key] = "";
    });
    return vals;
  }

  function openCreate() {
    setEditItem(null);
    form.reset(getDefaultValues());
    setModalOpen(true);
  }

  function openEdit(item: any) {
    setEditItem(item);
    const vals: any = {};
    fields.filter((f) => !f.hidden).forEach((f) => {
      vals[f.key] = item[f.key] ?? "";
    });
    form.reset(vals);
    setModalOpen(true);
  }

  async function handleSubmit(data: FormData) {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

    try {
      const res = editItem
        ? await fetch(`/api/master/${entity}/${editItem.id}`, { method: "PUT", headers, body: JSON.stringify(data) })
        : await fetch(`/api/master/${entity}`, { method: "POST", headers, body: JSON.stringify(data) });

      const result = await res.json();
      if (result.success) {
        toast.success(editItem ? `${title} berhasil diperbarui` : `${title} berhasil dibuat`);
        setModalOpen(false);
        fetchData();
      } else {
        toast.error(result.error || "Gagal menyimpan data");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  }

  async function handleDelete(id: string) {
    const ok = await confirm({
      title: `Hapus ${title}`,
      message: `Apakah Anda yakin ingin menghapus ${title.toLowerCase()} ini? Tindakan ini tidak dapat dibatalkan.`,
      confirmText: "Ya, Hapus",
      variant: "danger",
    });
    if (!ok) return;

    const token = localStorage.getItem("token");
    try {
      const res = await fetch(`/api/master/${entity}/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const result = await res.json();
      if (result.success) {
        toast.success(`${title} berhasil dihapus`);
        fetchData();
      } else {
        toast.error(result.error || "Gagal menghapus data");
      }
    } catch {
      toast.error("Terjadi kesalahan");
    }
  }

  function handleSort(key: string) {
    if (sortBy === key) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(key);
      setSortOrder("asc");
    }
  }

  const columns: Column<any>[] = displayFields.map((f) => ({
    key: f.key,
    label: f.label,
    width: f.width,
    sortable: ["text"].includes(f.type) && !f.key.endsWith("Id"),
    render: (item: any) => {
      const val = item[f.key];
      if (f.type === "boolean") {
        return <Badge variant={val ? "success" : "secondary"}>{val ? "Aktif" : "Nonaktif"}</Badge>;
      }
      if (f.type === "select" && f.options?.length) {
        const opt = f.options.find((o) => o.value === val);
        return String(opt?.label ?? val ?? "-");
      }
      return String(val ?? "-");
    },
  }));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">{title}</h1>
        <Button onClick={openCreate}>
          <Plus className="mr-2 size-4" /> Tambah {title}
        </Button>
      </div>

      <div className="relative mb-4 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="Cari..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
        />
      </div>

      <DataTable
        columns={columns}
        data={items}
        loading={loading}
        page={page}
        totalPages={totalPages}
        total={total}
        onPageChange={setPage}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        actions={(item) => (
          <div className="flex gap-1">
            <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
              <Pencil className="size-4" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}>
              <Trash2 className="size-4 text-destructive" />
            </Button>
          </div>
        )}
      />

      <Dialog open={modalOpen} onOpenChange={setModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editItem ? `Edit ${title}` : `Tambah ${title}`}</DialogTitle>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {fields
              .filter((f) => !f.hidden)
              .map((field) => {
                const isDisabled = field.disabled && !!editItem;

                if (field.type === "select") {
                  return (
                    <Controller
                      key={field.key}
                      name={field.key as any}
                      control={form.control}
                      render={({ field: controllerField, fieldState }) => (
                        <div>
                          <Combobox
                            label={field.label}
                            value={controllerField.value ?? ""}
                            onChange={controllerField.onChange}
                            options={field.options || []}
                            placeholder={`Pilih ${field.label}`}
                            required={field.required}
                            disabled={isDisabled}
                          />
                          {fieldState.error && (
                            <p className="text-sm text-destructive mt-1">{fieldState.error.message}</p>
                          )}
                        </div>
                      )}
                    />
                  );
                }

                if (field.type === "boolean") {
                  return (
                    <Controller
                      key={field.key}
                      name={field.key as any}
                      control={form.control}
                      render={({ field: f }) => (
                        <div>
                          <Label>{field.label}</Label>
                          <select
                            disabled={isDisabled}
                            className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                            value={String(f.value ?? true)}
                            onChange={(e) => f.onChange(e.target.value === "true")}
                          >
                            <option value="true">Aktif</option>
                            <option value="false">Nonaktif</option>
                          </select>
                        </div>
                      )}
                    />
                  );
                }

                if (field.type === "textarea") {
                  return (
                    <div key={field.key}>
                      <Label>{field.label}{field.required ? " *" : ""}</Label>
                      <textarea
                        disabled={isDisabled}
                        className="flex h-20 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs disabled:cursor-not-allowed disabled:opacity-50"
                        {...form.register(field.key as any)}
                      />
                      {form.formState.errors[field.key] && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors[field.key]?.message as string}
                        </p>
                      )}
                    </div>
                  );
                }

                return (
                  <div key={field.key}>
                    <Label>{field.label}{field.required ? " *" : ""}</Label>
                    <Input
                      type={field.type === "number" ? "number" : "text"}
                      disabled={isDisabled}
                      {...form.register(field.key as any, { valueAsNumber: field.type === "number" })}
                    />
                    {form.formState.errors[field.key] && (
                      <p className="text-sm text-destructive mt-1">
                        {form.formState.errors[field.key]?.message as string}
                      </p>
                    )}
                    {isDisabled && (
                      <p className="text-xs text-muted-foreground mt-1">Tidak dapat diubah setelah dibuat</p>
                    )}
                  </div>
                );
              })}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>
                Batal
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {editItem ? "Simpan" : "Buat"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
