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
  CalendarDays,
  Users,
  Sparkles,
  PencilLine,
  Clock3,
  ArrowRight,
} from "lucide-react";

import axios from "axios";
import { useRouter } from "next/navigation";

import Popup from "../ui/Popup";
import EventFields from "../ui/EventFields";
import { Pagination } from "@/components/ui/Pagination";

const LIMIT = 12;

type SelectionFilter = "all" | "selected" | "pending";

export default function AdminRecruitment() {
  const router = useRouter();

  const [page, setPage] = useState(1);
  const [recruits, setRecruits] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  const [recruitmentEventId, setRecruitmentEventId] = useState<string | null>(
    null
  );
  const [recruitmentEvent, setRecruitmentEvent] = useState<any | null>(null);
  const [formBuilderLoading, setFormBuilderLoading] = useState(true);

  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<SelectionFilter>("all");
  const [expanded, setExpanded] = useState<string | null>(null);

  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const fetchRecruits = async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await axios.get(
        `/api/recruitment?page=${pageNum}&limit=${LIMIT}`
      );
      setRecruits(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error(err);
      setRecruits([]);
      setPagination(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecruits(page);
  }, [page]);

  // load recruitment status (active event id)
  useEffect(() => {
    let mounted = true;
    const loadStatus = async () => {
      try {
        setFormBuilderLoading(true);
        const { data } = await axios.get("/api/recruitment/status");
        if (mounted) setRecruitmentEventId(data.eventId ?? null);
      } catch (err) {
        console.error(err);
      } finally {
        if (mounted) setFormBuilderLoading(false);
      }
    };
    loadStatus();
    return () => {
      mounted = false;
    };
  }, []);

  // load recruitment event details
  useEffect(() => {
    let mounted = true;
    const loadEvent = async () => {
      if (!recruitmentEventId) {
        setRecruitmentEvent(null);
        return;
      }
      try {
        const { data } = await axios.get(`/api/events/${recruitmentEventId}`);
        if (mounted && data.success) setRecruitmentEvent(data.event);
      } catch (err) {
        console.error(err);
      }
    };
    loadEvent();
    return () => {
      mounted = false;
    };
  }, [recruitmentEventId]);

  const updateSelection = async (id: string, isSelected: boolean) => {
    try {
      await axios.put(`/api/recruitment/${id}`, { isSelected });
      fetchRecruits(page);
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

  const confirmDeleteAll = () =>
    setPopup({
      show: true,
      type: "success",
      message: "Delete ALL recruitment records? This cannot be undone.",
      isConfirm: true,
      onConfirm: async () => {
        try {
          await axios.delete("/api/recruitment");
          fetchRecruits(1);
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
      },
    });

  const confirmDeleteEvent = () =>
    setPopup({
      show: true,
      type: "success",
      message:
        "Delete this recruitment event? This will remove form fields and cannot be undone.",
      isConfirm: true,
      onConfirm: async () => {
        if (!recruitmentEvent) return;
        try {
          await axios.delete(`/api/events/${recruitmentEvent.id}`);
          setRecruitmentEvent(null);
          setRecruitmentEventId(null);
          fetchRecruits(1);
        } catch (err) {
          console.error(err);
          setPopup({
            show: true,
            type: "success",
            message: "Unable to delete event.",
            isConfirm: false,
            onConfirm: () => {},
          });
        }
      },
    });

  const openRegistrationNow = async () => {
    if (!recruitmentEvent) return;
    try {
      const now = new Date().toISOString().slice(0, 16);
      const fd = new FormData();
      fd.append("registrationStart", now);
      fd.append(
        "registrationEnd",
        recruitmentEvent.registrationEnd
          ? new Date(recruitmentEvent.registrationEnd)
              .toISOString()
              .slice(0, 16)
          : ""
      );
      await axios({
        url: `/api/events/${recruitmentEvent.id}`,
        method: "PATCH",
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await axios.get(`/api/events/${recruitmentEvent.id}`);
      if (data.success) setRecruitmentEvent(data.event);
      setPopup({
        show: true,
        type: "success",
        message: "Registration opened.",
        isConfirm: false,
        onConfirm: () => {},
      });
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        type: "success",
        message: "Unable to open registration.",
        isConfirm: false,
        onConfirm: () => {},
      });
    }
  };

  const closeRegistrationNow = async () => {
    if (!recruitmentEvent) return;
    try {
      const now = new Date().toISOString().slice(0, 16);
      const fd = new FormData();
      fd.append("registrationEnd", now);
      await axios({
        url: `/api/events/${recruitmentEvent.id}`,
        method: "PATCH",
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });
      const { data } = await axios.get(`/api/events/${recruitmentEvent.id}`);
      if (data.success) setRecruitmentEvent(data.event);
      setPopup({
        show: true,
        type: "success",
        message: "Registration closed.",
        isConfirm: false,
        onConfirm: () => {},
      });
    } catch (err) {
      console.error(err);
      setPopup({
        show: true,
        type: "success",
        message: "Unable to close registration.",
        isConfirm: false,
        onConfirm: () => {},
      });
    }
  };

  const pendingOnPage = useMemo(
    () => recruits.filter((r) => !r.isSelected).length,
    [recruits]
  );
  const selectedOnPage = useMemo(
    () => recruits.filter((r) => r.isSelected).length,
    [recruits]
  );
  const totalApplications = pagination?.total ?? recruits.length;

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

  return (
    <div className="space-y-10">
      <section className="grid gap-6 xl:grid-cols-[1.4fr_420px]">
        <div className="rounded-3xl border border-white/10 bg-[#111111] p-8">
          <div className="flex items-center gap-3">
            <div className="rounded-2xl bg-emerald-500/10 p-3">
              <CalendarDays className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h2 className="mt-1 text-2xl font-bold text-white">
                Recruitment Event
              </h2>
            </div>
          </div>

          <p className="mt-6 max-w-xl leading-7 text-neutral-400">
            Create recruitment events, configure registration windows and manage
            applicant forms from a single dashboard.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2">
            <div className="group rounded-3xl border border-white/10 bg-[#0f0f0f] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Total Fields
              </p>
              <h3 className="mt-4 text-3xl font-bold text-white">
                {recruitmentEvent?.formFields?.length ?? "—"}
              </h3>
            </div>

            <div className="group rounded-3xl border border-white/10 bg-[#0f0f0f] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Applications
              </p>
              <h3 className="mt-4 text-3xl font-bold text-white">
                {totalApplications}
              </h3>
            </div>

            <div className="group rounded-3xl border border-white/10 bg-[#0f0f0f] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Selected
              </p>
              <h3 className="mt-4 text-3xl font-bold text-white">
                {selectedOnPage}
              </h3>
            </div>

            <div className="group rounded-3xl border border-white/10 bg-[#0f0f0f] p-5">
              <p className="text-xs uppercase tracking-[0.25em] text-neutral-500">
                Form Fields
              </p>
              <h3 className="mt-4 text-3xl font-bold text-white">
                {recruitmentEventId ? "Active" : "—"}
              </h3>
            </div>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-[#111111] p-6">
          {recruitmentEvent ? (
            <>
              <div className="inline-flex rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-emerald-400">
                Active Recruitment
              </div>
              <h3 className="mt-5 text-2xl font-bold text-white">
                {recruitmentEvent.title}
              </h3>

              <div className="mt-8 space-y-5">
                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Registration Starts
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {recruitmentEvent.registrationStart
                      ? new Date(
                          recruitmentEvent.registrationStart
                        ).toLocaleString()
                      : "Not Scheduled"}
                  </p>
                </div>

                <div className="rounded-2xl bg-black/20 p-4">
                  <p className="text-xs uppercase tracking-widest text-neutral-500">
                    Registration Ends
                  </p>
                  <p className="mt-2 text-sm text-white">
                    {recruitmentEvent.registrationEnd
                      ? new Date(
                          recruitmentEvent.registrationEnd
                        ).toLocaleString()
                      : "No End Date"}
                  </p>
                </div>
              </div>

              <div className="mt-8 space-y-3">
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={openRegistrationNow}
                    className="rounded-2xl bg-emerald-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Open
                  </button>
                  <button
                    onClick={closeRegistrationNow}
                    className="rounded-2xl bg-yellow-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Close
                  </button>
                  <button
                    onClick={confirmDeleteEvent}
                    className="rounded-2xl bg-red-600 px-3 py-2 text-sm font-semibold text-white"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 p-10 text-center">
              <CalendarDays className="mb-5 h-12 w-12 text-neutral-700" />
              <h3 className="text-lg font-semibold text-white">
                No Recruitment Event
              </h3>
              <p className="mt-3 max-w-xs text-sm leading-7 text-neutral-500">
                Create a recruitment event first. Once it's active, applicants
                can start submitting their forms.
              </p>
            </div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-[#111111] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full bg-blue-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.25em] text-blue-400">
              <PencilLine className="h-3.5 w-3.5" /> Form Builder
            </span>
            <h2 className="mt-5 text-3xl font-bold text-white">
              Recruitment Form
            </h2>
            <p className="mt-3 max-w-2xl text-neutral-400 leading-7">
              Customize the questions applicants must answer before submitting
              their recruitment application.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-4">
            <p className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Status
            </p>
            <p className="mt-2 font-semibold text-white">
              {recruitmentEventId
                ? "Recruitment Event Linked"
                : "No Recruitment Event"}
            </p>
          </div>
        </div>

        <div className="my-8 h-px bg-white/10" />

        {formBuilderLoading ? (
          <div className="flex h-52 items-center justify-center">
            <div className="flex flex-col items-center">
              <div className="h-10 w-10 animate-spin rounded-full border-2 border-emerald-500/20 border-t-emerald-400" />
              <p className="mt-6 text-sm text-neutral-500">
                Loading form builder...
              </p>
            </div>
          </div>
        ) : recruitmentEventId ? (
          <div className="rounded-3xl border border-white/10 bg-[#0f0f0f] p-5">
            <EventFields id={recruitmentEventId} />
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-white/10 py-20">
            <CalendarDays className="mb-6 h-12 w-12 text-neutral-700" />
            <h3 className="text-xl font-semibold text-white">
              Create a Recruitment Event
            </h3>
            <p className="mt-4 max-w-md text-center leading-7 text-neutral-500">
              Once a recruitment event is created, custom application fields can
              be attached and managed from here.
            </p>
          </div>
        )}
      </section>

      <section className="grid gap-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search applicants..."
              className="h-14 w-full rounded-2xl border border-white/10 bg-[#151515] pl-14 pr-5 text-white placeholder:text-neutral-600 outline-none transition-all focus:border-emerald-500/40"
            />
          </div>

          <div className="flex rounded-2xl border border-white/10 bg-[#151515] p-1">
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
                className={`rounded-xl px-6 py-3 text-sm font-semibold transition-all ${filter === tab.key ? "bg-emerald-500 text-black" : "text-neutral-400 hover:text-white"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          {loading ? (
            <div className="flex flex-col gap-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-24 animate-pulse rounded-2xl bg-[#0f0f0f]"
                />
              ))}
            </div>
          ) : visibleRecruits.length === 0 ? (
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
                    className={`overflow-hidden rounded-3xl border transition-all duration-300 ${isOpen ? "border-emerald-500/30 bg-[#171717] shadow-[0_0_40px_rgba(16,185,129,.08)]" : "border-white/10 bg-[#111111] hover:border-white/20 hover:bg-[#151515]"}`}
                  >
                    <div
                      className="flex cursor-pointer items-center justify-between gap-6 p-6"
                      onClick={() => setExpanded(isOpen ? null : r.id)}
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl font-bold text-lg ${r.isSelected ? "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30" : "bg-white/5 text-white ring-1 ring-white/10"}`}
                        >
                          {(r.name || "?")
                            .split(" ")
                            .map((p: string) => p[0])
                            .slice(0, 2)
                            .join("")}
                        </div>
                        <div className="min-w-0">
                          <p className="text-lg font-bold text-white truncate">
                            {r.name}
                          </p>
                          <p className="mt-1 text-sm text-neutral-400">
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
                          className={`rounded-xl px-4 py-2 text-xs font-semibold ${r.isSelected ? "bg-emerald-500 text-black" : "bg-neutral-800 text-neutral-300 hover:bg-neutral-700"}`}
                        >
                          {r.isSelected ? "Selected" : "Pending"}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setPopup({
                              show: true,
                              type: "success",
                              message: `Delete application from ${r.name}?`,
                              isConfirm: true,
                              onConfirm: () => {
                                axios
                                  .delete(`/api/recruitment/${r.id}`)
                                  .then(() => fetchRecruits(page))
                                  .catch(() =>
                                    setPopup({
                                      show: true,
                                      type: "success",
                                      message: "Unable to delete.",
                                      isConfirm: false,
                                      onConfirm: () => {},
                                    })
                                  );
                              },
                            });
                          }}
                          className="rounded-xl border border-red-500/20 p-3 text-red-400 hover:bg-red-500/10"
                        >
                          {" "}
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-white/5"
                        >
                          <div className="grid grid-cols-2 gap-4 px-4 pb-4 pt-4 text-xs md:grid-cols-3">
                            <div className="flex items-start gap-2">
                              <Mail className="mt-0.5 h-3.5 w-3.5 shrink-0 text-neutral-600" />
                              <div>
                                <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                                  Personal Email
                                </p>
                                <p className="text-neutral-300 break-all">
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
                                <p className="text-neutral-300 break-all">
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
        </div>

        {pagination && (
          <div className="pt-6">
            <Pagination
              page={pagination.page}
              totalPages={pagination.totalPages}
              total={pagination.total}
              limit={pagination.limit}
              onPageChange={setPage}
            />
          </div>
        )}
      </section>

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
}
