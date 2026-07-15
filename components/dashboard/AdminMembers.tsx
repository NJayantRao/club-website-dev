"use client";
import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Upload } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";
import MemberModal from "../ui/MemberModal";
import axios from "axios";
import { Role } from "@prisma/client";

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
type PopupType = "success" | "error" | "confirm";

type PopupState = {
  show: boolean;
  type: PopupType;
  message: string;
  isConfirm: boolean;
  onConfirm: () => void;
};

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

const EMPTY_FORM = {
  name: "",
  email: "",
  phone: "",
  role: Role.MEMBER,
  year: "",
  skills: "",
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
  const [memberId, setMemberId] = useState<string | null>(null);
  const [form, setForm] = useState<MemberFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [popup, setPopup] = useState<PopupState>({
    show: false,
    type: "success",
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const updateField = (key: keyof MemberFormData, value: string) =>
    setForm((f: MemberFormData) => ({ ...f, [key]: value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setMemberId(null);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (member: any) => {
    setMemberId(member.id);
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

      fd.append("name", form.name);
      fd.append("email", form.email);
      fd.append("phone", form.phone);
      fd.append("role", form.role);
      fd.append("year", form.year);

      fd.append(
        "skills",
        JSON.stringify(
          form.skills
            .split(",")
            .map((s: string) => s.trim())
            .filter(Boolean)
        )
      );

      if (imageFile) {
        fd.append("image", imageFile);
      }

      const url = memberId ? `/api/members/${memberId}` : "/api/members";
      const method = memberId ? "PATCH" : "POST";
      const { data } = await axios({
        url,
        method,
        data: fd,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setShowModal(false);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      setMemberId(null);
      refetch();
      setPopup({
        show: true,
        type: "success",
        message: memberId ? "Member updated!" : "Member added!",
        isConfirm: false,
        onConfirm: () => {},
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setPopup({
          show: true,
          type: "error",
          message: err.response?.data?.message ?? "Something went wrong.",
          isConfirm: false,
          onConfirm: () => {},
        });
      } else {
        setPopup({
          show: true,
          type: "error",
          message: "Something went wrong.",
          isConfirm: false,
          onConfirm: () => {},
        });
      }
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
            className="group bg-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-white/20 transition-all"
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
              <div className="absolute inset-0 bg-linear-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-3 gap-2">
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
        <MemberModal
          memberId={memberId}
          form={form}
          errors={errors}
          imagePreview={imagePreview}
          isSaving={isSaving}
          updateField={updateField}
          setImageFile={setImageFile}
          setImagePreview={setImagePreview}
          onClose={() => setShowModal(false)}
          onSubmit={onSubmit}
        />
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
