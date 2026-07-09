"use client";
import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";

// Local simple list loader replaced useAdminList hook
const useAdminList = (url: string) => {
  const [data, setData] = React.useState<any[]>([]);
  const [pagination, setPagination] = React.useState<any | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(url);
      const json = await res.json();
      setData(json.data || []);
      setPagination(json.pagination || null);
    } catch (e) {
      setData([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [url]);

  return { data, pagination, isLoading, refetch: fetchData } as const;
};

type FieldErrors = Record<string, string>;
type MemberFormData = any;
const validateMember = (f: MemberFormData) => {
  const errs: FieldErrors = {};
  if (!f.name) errs.name = "Name is required";
  if (!f.role) errs.role = "Role is required";
  return errs;
};

const LIMIT = 12;
const CATEGORIES = ["member", "alumni", "advisor"] as const;
const PLATFORMS = [
  "linkedin",
  "github",
  "twitter",
  "instagram",
  "website",
  "other",
] as const;

const EMPTY_FORM: MemberFormData = {
  name: "",
  role: "",
  category: "member",
  section: "",
  bio: "",
  platform: "linkedin",
};

const AdminMembers = () => {
  const [page, setPage] = useState(1);
  const {
    data: members,
    pagination,
    isLoading,
    refetch,
  } = useAdminList(`/api/members?page=${page}&limit=${LIMIT}`);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const updateField = (key: keyof MemberFormData, value: string) =>
    setForm((f: MemberFormData) => ({ ...f, [key]: value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditId(null);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (member: any) => {
    setEditId(member.id);
    setErrors({});
    setForm({
      name: member.name ?? "",
      role: member.role ?? "",
      category: member.category ?? "member",
      section: member.section ?? "",
      bio: member.bio ?? "",
      platform: member.platform ?? "linkedin",
      color: member.color,
      year: member.year,
    });
    setImagePreview(member.img);
    setImageFile(null);
    setShowModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateMember(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null) fd.append(k, String(v));
      });
      if (imageFile) fd.append("img", imageFile);

      const url = editId ? `/api/members/${editId}` : "/api/members";
      const method = editId ? "PUT" : "POST";
      const res = await fetch(url, { method, body: fd });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      setShowModal(false);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      setEditId(null);
      refetch();
      setPopup({
        show: true,
        type: "success",
        message: editId ? "Member updated!" : "Member added!",
        isConfirm: false,
        onConfirm: () => {},
      });
    } catch (err: any) {
      setPopup({
        show: true,
        type: "success",
        message: err.message ?? "Something went wrong.",
        isConfirm: false,
        onConfirm: () => {},
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteMember = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id: string, name: string) =>
    setPopup({
      show: true,
      type: "success",
      message: `Delete ${name}?`,
      isConfirm: true,
      onConfirm: () => {
        deleteMember(id);
        setPopup((p) => ({ ...p, show: false }));
      },
    });

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Members{" "}
          <span className="text-neutral-500 text-sm font-normal ml-2">
            ({pagination?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Member
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {members.map((m: any) => (
          <div
            key={m.id}
            className="group bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
          >
            <div className="relative h-36 overflow-hidden bg-white/5">
              <img
                src={m.img}
                alt={m.name}
                className="w-full h-full object-cover object-top"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/placeholder.jpg";
                }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
                <button
                  onClick={() => openEdit(m)}
                  className="p-2 bg-white/20 backdrop-blur-sm rounded-lg text-white hover:bg-white/30"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => confirmDelete(m.id, m.name)}
                  className="p-2 bg-red-500/30 backdrop-blur-sm rounded-lg text-red-300 hover:bg-red-500/50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
            <div className="p-3">
              <p className="text-white font-semibold text-sm truncate">
                {m.name}
              </p>
              <p className="text-neutral-500 text-xs">{m.role}</p>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/5 text-neutral-500 text-[10px] uppercase">
                {m.category}
              </span>
            </div>
          </div>
        ))}
      </div>

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
        />
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editId ? "Edit Member" : "Add Member"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              {/* Image upload */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10">
                  {imagePreview ? (
                    <img
                      src={imagePreview}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Upload className="w-6 h-6 text-neutral-600 m-auto mt-5" />
                  )}
                </div>
                <label className="cursor-pointer px-4 py-2 border border-white/10 rounded-xl text-sm text-neutral-400 hover:border-white/20 hover:text-white transition-all">
                  {imagePreview ? "Change Photo" : "Upload Photo"}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0];
                      if (f) {
                        setImageFile(f);
                        const r = new FileReader();
                        r.onloadend = () => setImagePreview(r.result as string);
                        r.readAsDataURL(f);
                      }
                    }}
                  />
                </label>
              </div>

              {(
                [
                  ["name", "Full Name"],
                  ["role", "Role / Title"],
                  ["section", "Section"],
                  ["bio", "Bio"],
                ] as const
              ).map(([name, label]) => (
                <div key={name} className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">
                    {label}
                  </label>
                  <input
                    type="text"
                    value={form[name] ?? ""}
                    onChange={(e) => updateField(name, e.target.value)}
                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all ${errors[name] ? "border-red-500/50" : "border-white/10 focus:border-white/20"}`}
                  />
                  {errors[name] && (
                    <p className="text-red-400 text-xs">{errors[name]}</p>
                  )}
                </div>
              ))}

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">
                    Category
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    value={form.category}
                    onChange={(e) => updateField("category", e.target.value)}
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black">
                    Platform
                  </label>
                  <select
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none"
                    value={form.platform}
                    onChange={(e) => updateField("platform", e.target.value)}
                  >
                    {PLATFORMS.map((p) => (
                      <option key={p} value={p}>
                        {p}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-neutral-400 hover:text-white hover:border-white/20 transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all disabled:opacity-50"
                >
                  {isSaving ? "Saving..." : editId ? "Update" : "Add Member"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Popup
        show={popup.show}
        type={popup.type}
        message={popup.message}
        isConfirm={popup.isConfirm}
        onConfirm={popup.onConfirm}
        onClose={() => setPopup((p) => ({ ...p, show: false }))}
      />
    </div>
  );
};

export default AdminMembers;
