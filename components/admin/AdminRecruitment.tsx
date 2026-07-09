"use client";
import React, { useEffect, useState } from "react";
import {
  Trash2,
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";

const LIMIT = 15;

const fetchRecruitment = async (page: number) => {
  const res = await fetch(
    `/api/recruitment?type=recruitment&page=${page}&limit=${LIMIT}`
  );
  if (!res.ok) throw new Error("Failed to fetch");
  return res.json();
};

const AdminRecruitment: React.FC = () => {
  const [page, setPage] = useState(1);
  const [recruits, setRecruits] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const load = async (pageNum = page) => {
    setIsLoading(true);
    try {
      const data = await fetchRecruitment(pageNum);
      setRecruits(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(page); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page]);

  const updateSelection = async (id: string, isSelected: boolean) => {
    try {
      const res = await fetch(`/api/recruitment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isSelected }),
      });
      if (!res.ok) throw new Error("Update failed");
      setPopup({
        show: true,
        type: "success",
        message: "Status updated",
        isConfirm: false,
        onConfirm: () => {},
      });
      load(page);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        type: "success",
        message: "Unable to update.",
        isConfirm: false,
        onConfirm: () => {},
      });
    }
  };

  const deleteAll = async () => {
    try {
      const res = await fetch("/api/recruitment", { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      load(1);
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        type: "success",
        message: "Unable to clear.",
        isConfirm: false,
        onConfirm: () => {},
      });
    }
  };

  const confirmDeleteAll = () =>
    setPopup({
      show: true,
      type: "success",
      message: "Delete ALL recruitment records? This cannot be undone.",
      isConfirm: true,
      onConfirm: () => {
        deleteAll();
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
          Recruitment Applications{" "}
          <span className="text-neutral-500 text-sm font-normal ml-2">
            ({pagination?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={confirmDeleteAll}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-red-400 border border-red-400/30 hover:bg-red-400/10 transition-all text-sm"
        >
          <Trash2 className="w-4 h-4" /> Clear All
        </button>
      </div>

      {recruits.length === 0 ? (
        <p className="text-neutral-500 text-center py-16">
          No applications yet.
        </p>
      ) : (
        <div className="space-y-3">
          {recruits.map((r: any) => (
            <div
              key={r.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`w-2 h-2 rounded-full ${r.isSelected ? "bg-green-500" : "bg-neutral-600"}`}
                  />
                  <div>
                    <p className="text-white font-semibold text-sm">{r.name}</p>
                    <p className="text-neutral-500 text-xs">
                      {r.rollNo} · {r.branch}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      updateSelection(r.id, !r.isSelected);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${r.isSelected ? "bg-green-500/20 text-green-400 hover:bg-green-500/30" : "bg-white/5 text-neutral-400 hover:bg-white/10"}`}
                  >
                    {r.isSelected ? (
                      <>
                        <CheckCircle className="w-3 h-3 inline mr-1" />
                        Selected
                      </>
                    ) : (
                      <>
                        <XCircle className="w-3 h-3 inline mr-1" />
                        Pending
                      </>
                    )}
                  </button>
                  {expanded === r.id ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </div>
              </div>
              {expanded === r.id && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    ["Email", r.personalEmail],
                    ["Institute Email", r.instituteEmail],
                    ["Phone", r.phoneNo],
                    ["Gender", r.gender],
                    ["Locality", r.locality],
                    ["Tech Stack", r.techStack],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="text-neutral-600 uppercase tracking-wider mb-0.5">
                        {label}
                      </p>
                      <p className="text-neutral-300">{value || "—"}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {pagination && (
        <Pagination
          page={pagination.page}
          totalPages={pagination.totalPages}
          total={pagination.total}
          limit={pagination.limit}
          onPageChange={setPage}
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

export default AdminRecruitment;
