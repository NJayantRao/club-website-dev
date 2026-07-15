"use client";
import React, { useEffect, useState } from "react";

import { Plus, Trash2, X } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";
import { Achievement } from "@prisma/client";

const LIMIT = 10;
const TYPES = [
  "general",
  "competition",
  "hackathon",
  "certification",
  "award",
] as const;

const AdminAchievements: React.FC = () => {
  const [page, setPage] = useState(1);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [saving, setSaving] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const initialForm = {
    name: "",
    description: "",
    achievementTag: "general",
    achievedAt: "",
  };
  const [form, setForm] = useState(initialForm);

  const fetchAchievements = async (pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/achievements/achievements?page=${pageNum}&limit=${LIMIT}`
      );
      if (!res.ok) return;
      const data = await res.json();
      setAchievements(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const resetForm = () => setForm(initialForm);

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", form.name);
      fd.append("description", form.description);
      fd.append("achievementTag", form.achievementTag);
      if (form.achievedAt) fd.append("achievedAt", form.achievedAt);
      photoFiles.forEach((f) => fd.append("photos", f));

      const res = await fetch("/api/achievements/achievements", {
        method: "POST",
        body: fd,
      });

      if (!res.ok) throw new Error("Failed to save achievement");

      setShowModal(false);
      setPhotoFiles([]);
      resetForm();
      setPopup({
        show: true,
        type: "success",
        message: "Achievement added!",
        isConfirm: false,
        onConfirm: () => {},
      });
      fetchAchievements(1);
      setPage(1);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        type: "success",
        message: "Unable to save.",
        isConfirm: false,
        onConfirm: () => {},
      });
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = (id: string, name: string) =>
    setPopup({
      show: true,
      type: "success",
      message: `Delete "${name}"?`,
      isConfirm: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`/api/achievements/achievements/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Delete failed");
          setPopup((p) => ({ ...p, show: false }));
          fetchAchievements(page);
        } catch (err) {
          console.error(err);
          setPopup({
            show: true,
            type: "success",
            message: "Unable to delete.",
            isConfirm: false,
            onConfirm: () => {},
          });
        }
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
          Achievements{" "}
          <span className="text-neutral-500 text-sm font-normal ml-2">
            ({pagination?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={() => {
            resetForm();
            setPhotoFiles([]);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Achievement
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {achievements.map((a: any) => (
          <div
            key={a.id}
            className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden flex gap-0"
          >
            {a.images?.[0] && (
              <img
                src={a.images[0].imageUrl}
                alt=""
                className="w-24 h-full object-cover flex-shrink-0"
              />
            )}
            <div className="p-4 flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-white font-semibold text-sm truncate">
                    {a.name}
                  </p>
                  <span className="inline-block px-2 py-0.5 rounded-full bg-white/5 text-neutral-400 text-[10px] uppercase mt-1">
                    {a.achievementTag}
                  </span>
                </div>
                <button
                  onClick={() => confirmDelete(a.id, a.name)}
                  className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg flex-shrink-0"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-neutral-500 text-xs mt-2 line-clamp-2">
                {a.description}
              </p>
            </div>
          </div>
        ))}
        {achievements.length === 0 && (
          <p className="text-neutral-500 col-span-2 text-center py-16">
            No achievements yet.
          </p>
        )}
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
              <h3 className="text-lg font-bold text-white">Add Achievement</h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                  Name
                </label>
                <input
                  value={form.name}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, name: e.target.value }))
                  }
                  required
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none focus:border-white/20"
                />
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                  Description
                </label>
                <textarea
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  rows={3}
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm focus:outline-none resize-none"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Type
                  </label>
                  <select
                    value={form.achievementTag}
                    onChange={(e) =>
                      setForm((f) => ({
                        ...f,
                        achievementTag: e.target.value,
                      }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  >
                    {TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Date Achieved
                  </label>
                  <input
                    type="date"
                    value={form.achievedAt}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, achievedAt: e.target.value }))
                    }
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white text-sm"
                  />
                </div>
              </div>
              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                  Photos
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full text-neutral-400 text-sm"
                  onChange={(e) =>
                    setPhotoFiles(Array.from(e.target.files ?? []))
                  }
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-neutral-400 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="flex-1 py-3 bg-white text-black rounded-xl font-semibold text-sm disabled:opacity-50"
                >
                  {saving ? "Saving..." : "Add Achievement"}
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

export default AdminAchievements;
