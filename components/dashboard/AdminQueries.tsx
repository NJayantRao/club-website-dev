"use client";
import React, { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, ChevronDown, Mail, Phone, Search, Inbox } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";
import axios from "axios";

const LIMIT = 15;

interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  message: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

function initials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

const AdminQueries: React.FC = () => {
  const [page, setPage] = useState(1);
  const [queries, setQueries] = useState<ContactQuery[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const fetchQueries = async (pageNum = page) => {
    setIsLoading(true);

    try {
      const { data } = await axios.get(
        `/api/contact-us?page=${pageNum}&limit=${LIMIT}`
      );

      setQueries(data.data ?? []);
      setPagination(data.pagination ?? null);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueries(
      page
    ); /* eslint-disable-next-line react-hooks/exhaustive-deps */
  }, [page]);

  const confirmDeleteQuery = (id: string, name: string) =>
    setPopup({
      show: true,
      type: "success",
      message: `Delete query from ${name}?`,
      isConfirm: true,
      onConfirm: async () => {
        try {
          await axios.delete(`/api/contact-us/${id}`);
          setPopup((p) => ({ ...p, show: false }));
          fetchQueries(page);
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

  const visibleQueries = useMemo(() => {
    const q = query.trim().toLowerCase();

    if (!q) return queries;

    return queries.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.phoneNo?.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
    );
  }, [queries, query]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-7 w-48 animate-pulse rounded-lg bg-white/5" />

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
      <div>
        <h2 className="text-lg font-bold text-white">Contact Queries</h2>
        <p className="mt-1 text-xs text-neutral-500">
          {pagination?.total ?? queries.length} total quer
          {(pagination?.total ?? queries.length) === 1 ? "y" : "ies"}
        </p>
      </div>

      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-500" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by name, email, phone, or message..."
          className="w-full rounded-2xl border border-white/10 bg-white/[0.03] py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-neutral-600 focus:border-white/20"
        />
      </div>

      {visibleQueries.length === 0 ? (
        <div className="flex h-72 flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-white/10 text-center">
          <Inbox className="h-8 w-8 text-neutral-700" />
          <p className="text-neutral-500">
            {queries.length === 0
              ? "No queries yet."
              : "No queries match your search."}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {visibleQueries.map((q) => {
            const isOpen = expanded === q.id;

            return (
              <div
                key={q.id}
                className={`overflow-hidden rounded-2xl border bg-white/[0.03] transition-colors ${
                  isOpen ? "border-white/20" : "border-white/10"
                }`}
              >
                <div
                  className="flex cursor-pointer items-center justify-between gap-4 p-4 transition-all hover:bg-white/5"
                  onClick={() => setExpanded(isOpen ? null : q.id)}
                >
                  <div className="flex min-w-0 items-center gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-sm font-semibold text-neutral-300 ring-1 ring-white/10">
                      {initials(q.name) || "?"}
                    </div>

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-white">
                        {q.name}
                      </p>
                      <p className="truncate text-xs text-neutral-500">
                        {new Date(q.createdAt).toLocaleDateString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        confirmDeleteQuery(q.id, q.name);
                      }}
                      className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-400/10"
                      aria-label={`Delete query from ${q.name}`}
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
                      <div className="space-y-3 px-4 pb-4 pt-4">
                        <div className="flex flex-wrap gap-4 text-xs">
                          <span className="flex items-center gap-1.5 text-neutral-400">
                            <Mail className="h-3 w-3" />
                            {q.email}
                          </span>

                          {q.phoneNo && (
                            <span className="flex items-center gap-1.5 text-neutral-400">
                              <Phone className="h-3 w-3" />
                              {q.phoneNo}
                            </span>
                          )}
                        </div>

                        <p className="rounded-xl bg-white/5 p-3 text-sm leading-relaxed text-neutral-300">
                          {q.message}
                        </p>
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

export default AdminQueries;
