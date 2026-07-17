"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Trash2,
  ChevronDown,
  CheckCircle2,
  XCircle,
  Search,
  Mail,
  Phone,
  MapPin,
  Code2,
  User,
  Inbox,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";
import axios from "axios";

const LIMIT = 15;

interface RecruitmentApplication {
  id: string;
  name: string;
  rollNo: string;
  instituteEmail: string;
  personalEmail: string;
  gender: string;
  branch: string;
  phoneNo: string;
  locality: string;
  techStack: string;
  isSelected: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

type SelectionFilter = "all" | "selected" | "pending";

const fetchRecruitment = async (page: number) => {
  const { data } = await axios.get(
    `/api/recruitment?page=${page}&limit=${LIMIT}`
  );
  return data;
};

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const AdminRecruitment: React.FC = () => {
  const [page, setPage] = useState(1);
  const [recruits, setRecruits] = useState<RecruitmentApplication[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SelectionFilter>("all");
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
      await axios.put(`/api/recruitment/${id}`, { isSelected });
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

  const deleteOne = async (id: string) => {
    try {
      await axios.delete(`/api/recruitment/${id}`);
      load(page);
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
  };

  const confirmDeleteOne = (id: string, name: string) =>
    setPopup({
      show: true,
      type: "success",
      message: `Delete application from ${name}?`,
      isConfirm: true,
      onConfirm: () => {
        deleteOne(id);
        setPopup((p) => ({ ...p, show: false }));
      },
    });

  const deleteAll = async () => {
    try {
      await axios.delete("/api/recruitment");
      load(1);
      setPage(1);
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

  const selectedOnPage = useMemo(
    () => recruits.filter((r) => r.isSelected).length,
    [recruits]
  );

  const visibleRecruits = useMemo(() => {
    const q = query.trim().toLowerCase();

    return recruits.filter((r) => {
      if (filter === "selected" && !r.isSelected) return false;
      if (filter === "pending" && r.isSelected) return false;

      if (!q) return true;

      return (
        r.name.toLowerCase().includes(q) ||
        r.rollNo.toLowerCase().includes(q) ||
        r.branch.toLowerCase().includes(q) ||
        r.personalEmail.toLowerCase().includes(q) ||
        r.instituteEmail.toLowerCase().includes(q)
      );
    });
  }, [recruits, query, filter]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="h-7 w-64 animate-pulse rounded-lg bg-white/5" />
          <div className="h-9 w-24 animate-pulse rounded-xl bg-white/5" />
        </div>

        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div
              key={i}
              className="h-[64px] animate-pulse rounded-2xl border border-white/10 bg-white/[0.03]"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white">
            Recruitment Applications
          </h2>
          <p className="mt-1 text-xs text-neutral-500">
            {pagination?.total ?? recruits.length} total application
            {(pagination?.total ?? recruits.length) === 1 ? "" : "s"} ·{" "}
            {selectedOnPage} selected on this page
          </p>
        </div>

        <button
          onClick={confirmDeleteAll}
          className="flex items-center gap-2 rounded-xl border border-red-400/30 px-4 py-2 text-sm text-red-400 transition-all hover:bg-red-400/10"
        >
          <Trash2 className="h-4 w-4" /> Clear All
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, roll no, branch, or email..."
            className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/20"
          />
        </div>

        <div className="flex items-center gap-2 rounded-2xl border border-white/10 bg-white/[0.03] p-1">
          {(
            [
              { key: "all", label: "All" },
              { key: "selected", label: "Selected" },
              { key: "pending", label: "Pending" },
            ] as { key: SelectionFilter; label: string }[]
          ).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              className={`rounded-xl px-4 py-2 text-xs font-semibold uppercase tracking-wider transition ${
                filter === tab.key
                  ? "bg-white text-black"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {visibleRecruits.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 text-center">
          <Inbox className="h-8 w-8 text-neutral-700" />
          <p className="text-neutral-500">
            {recruits.length === 0
              ? "No applications yet."
              : "No applications match your search or filter."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleRecruits.map((r) => {
            const isOpen = expanded === r.id;

            return (
              <div
                key={r.id}
                className={`overflow-hidden rounded-2xl border bg-white/[0.03] transition-colors ${
                  isOpen ? "border-white/20" : "border-white/10"
                }`}
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-all hover:bg-white/5"
                  onClick={() => setExpanded(isOpen ? null : r.id)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold ${
                        r.isSelected
                          ? "bg-green-500/15 text-green-300 ring-1 ring-green-500/30"
                          : "bg-white/10 text-neutral-300 ring-1 ring-white/10"
                      }`}
                    >
                      {initials(r.name) || "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {r.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {r.rollNo} · {r.branch}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        updateSelection(r.id, !r.isSelected);
                      }}
                      className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                        r.isSelected
                          ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                          : "bg-white/5 text-neutral-400 hover:bg-white/10"
                      }`}
                    >
                      {r.isSelected ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" />
                          Selected
                        </>
                      ) : (
                        <>
                          <XCircle className="h-3 w-3" />
                          Pending
                        </>
                      )}
                    </button>

                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteOne(r.id, r.name);
                      }}
                      className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-400/10"
                      aria-label={`Delete application from ${r.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <motion.div
                      animate={{ rotate: isOpen ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="h-4 w-4 text-neutral-500" />
                    </motion.div>
                  </div>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2, ease: "easeInOut" }}
                      className="overflow-hidden border-t border-white/5"
                    >
                      <div className="grid grid-cols-2 gap-4 px-4 pb-4 pt-4 text-xs md:grid-cols-3">
                        <div className="flex items-start gap-2">
                          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          <div>
                            <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                              Personal Email
                            </p>
                            <p className="text-neutral-300">
                              {r.personalEmail || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          <div>
                            <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                              Institute Email
                            </p>
                            <p className="text-neutral-300">
                              {r.instituteEmail || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Phone className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          <div>
                            <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                              Phone
                            </p>
                            <p className="text-neutral-300">
                              {r.phoneNo || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <User className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          <div>
                            <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                              Gender
                            </p>
                            <p className="text-neutral-300">
                              {r.gender || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          <div>
                            <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                              Locality
                            </p>
                            <p className="text-neutral-300">
                              {r.locality || "—"}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-start gap-2">
                          <Code2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                          <div>
                            <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                              Tech Stack
                            </p>
                            <p className="text-neutral-300">
                              {r.techStack || "—"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="border-t border-white/5 px-4 py-3 text-[11px] text-neutral-600">
                        Applied on {new Date(r.createdAt).toLocaleString()}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
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
