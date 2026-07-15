"use client";

import React, { useMemo, useState } from "react";
import { Plus, Edit2, Trash2 } from "lucide-react";
import { Role } from "@prisma/client";
import axios from "axios";

import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";
import MemberModal from "../ui/MemberModal";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  designation: string | null;
  year: string | null;
  skills: string[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface AdminMembersProps {
  role?: "MEMBER" | "ADVISOR" | "ALUMNI";
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const useAdminList = <T,>(url: string) => {
  const [data, setData] = React.useState<T[]>([]);
  const [pagination, setPagination] = React.useState<PaginationInfo | null>(
    null
  );
  const [isLoading, setIsLoading] = React.useState(true);

  const fetchData = async () => {
    setIsLoading(true);

    try {
      const { data: response } = await axios.get(url);

      setData(response.data ?? []);
      setPagination(response.pagination ?? null);
    } catch (err) {
      console.error(err);
      setData([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  React.useEffect(() => {
    fetchData();
  }, [url]);

  return {
    data,
    pagination,
    isLoading,
    refetch: fetchData,
  } as const;
};

type FieldErrors = Record<string, string>;

type MemberFormData = {
  name: string;
  email: string;
  phone: string;
  role: Role;
  year: string;
  skills: string;
};

export type PopupType = "success" | "error" | "confirm";

interface PopupState {
  show: boolean;
  type: PopupType;
  message: string;
  isConfirm: boolean;
  onConfirm: () => void;
}

const validateMember = (form: MemberFormData) => {
  const errors: FieldErrors = {};

  if (!form.name.trim()) {
    errors.name = "Name is required";
  }

  if (!form.email.trim()) {
    errors.email = "Email is required";
  }

  if (!form.skills.trim()) {
    errors.skills = "At least one skill is required";
  }

  return errors;
};

const LIMIT = 12;

const EMPTY_FORM: MemberFormData = {
  name: "",
  email: "",
  phone: "",
  role: Role.MEMBER,
  year: "",
  skills: "",
};

interface MemberCardProps {
  member: Member;
  onEdit: (member: Member) => void;
}

const MemberCard = ({ member, onEdit }: MemberCardProps) => (
  <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:border-white/20">
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-[#111]">
      <div className="relative aspect-[4/5] overflow-hidden">
        <img
          src={member.imageUrl ?? "/placeholder.jpg"}
          alt={member.name}
          className="absolute inset-0 h-full w-full object-cover object-center transition duration-500 group-hover:scale-105"
        />

        {/* Hover Overlay */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition duration-300">
          <button
            onClick={() => onEdit(member)}
            className="absolute top-3 right-3 rounded-xl bg-white/15 p-2 text-white backdrop-blur-md hover:bg-white hover:text-black transition"
          >
            <Edit2 className="h-4 w-4" />
          </button>
        </div>

        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black via-black/70 to-transparent" />
      </div>

      <div className="p-4">
        <h3 className="truncate text-lg font-semibold text-white">
          {member.name}
        </h3>

        <p className="mt-1 text-sm uppercase tracking-wide text-neutral-400">
          {member.role}
        </p>

        {member.year && (
          <span className="mt-3 inline-flex rounded-full bg-white/10 px-3 py-1 text-xs text-neutral-300">
            {member.year}
          </span>
        )}
      </div>
    </div>
  </div>
);

interface MemberSectionProps {
  title: string;
  members: Member[];
  onEdit: (member: Member) => void;
}

const MemberSection = ({ title, members, onEdit }: MemberSectionProps) => {
  if (members.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-base font-semibold text-white">
        {title}{" "}
        <span className="ml-2 text-sm font-normal text-neutral-500">
          ({members.length})
        </span>
      </h3>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
        {members.map((member) => (
          <MemberCard key={member.id} member={member} onEdit={onEdit} />
        ))}
      </div>
    </div>
  );
};

const AdminMembers = ({ role = "MEMBER" }: AdminMembersProps) => {
  const [page, setPage] = useState(1);

  const {
    data: members,
    pagination,
    isLoading,
    refetch,
  } = useAdminList<Member>(
    `/api/our-team?page=${page}&limit=${LIMIT}&sortBy=year&role=${role}`
  );

  const { current, alumni, advisors } = useMemo(() => {
    const groups: { current: Member[]; alumni: Member[]; advisors: Member[] } =
      {
        current: [],
        alumni: [],
        advisors: [],
      };

    for (const member of members) {
      switch (member.role) {
        case Role.ALUMNI:
          groups.alumni.push(member);
          break;
        case Role.ADVISOR:
          groups.advisors.push(member);
          break;
        default:
          groups.current.push(member);
      }
    }

    return groups;
  }, [members]);

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

  const updateField = (key: keyof MemberFormData, value: string | Role) => {
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setMemberId(null);
    setImageFile(null);
    setImagePreview(null);
    setShowModal(true);
  };

  const openEdit = (member: Member) => {
    setMemberId(member.id);
    setErrors({});

    setForm({
      name: member.name ?? "",
      email: member.email ?? "",
      phone: member.phone ?? "",
      role: member.role ?? Role.MEMBER,
      year: member.year ?? "",
      skills: (member.skills ?? []).join(", "),
    });

    setImagePreview(member.imageUrl ?? null);
    setImageFile(null);
    setShowModal(true);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationErrors = validateMember(form);
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

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
            .map((skill) => skill.trim())
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

      refetch();

      setPopup({
        show: true,
        type: "success",
        message: data.message,
        isConfirm: false,
        onConfirm: () => {},
      });

      setShowModal(false);
      setMemberId(null);
      setForm(EMPTY_FORM);
      setImageFile(null);
      setImagePreview(null);
      setErrors({});
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
      const { data } = await axios.delete(`/api/members/${id}`);

      refetch();

      setPopup({
        show: true,
        type: "success",
        message: data.message,
        isConfirm: false,
        onConfirm: () => {},
      });
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setPopup({
          show: true,
          type: "error",
          message: err.response?.data?.message ?? "Failed to delete member.",
          isConfirm: false,
          onConfirm: () => {},
        });
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">
          Members{" "}
          <span className="ml-2 text-sm font-normal text-neutral-500">
            ({pagination?.total ?? members.length})
          </span>
        </h2>

        <button
          onClick={openAdd}
          className="flex items-center gap-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black transition hover:bg-neutral-200"
        >
          <Plus className="h-4 w-4" />
          Add Member
        </button>
      </div>

      <div className="space-y-10">
        <MemberSection
          title="Current Members"
          members={current}
          onEdit={openEdit}
        />
        <MemberSection title="Alumni" members={alumni} onEdit={openEdit} />
        <MemberSection title="Advisors" members={advisors} onEdit={openEdit} />
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
        onClose={() =>
          setPopup((prev) => ({
            ...prev,
            show: false,
          }))
        }
      />
    </div>
  );
};
export default AdminMembers;
