"use client";

import React, { useEffect, useState } from "react";
import { Calendar, ChevronDown, ChevronUp } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";

const LIMIT = 15;

const AdminEventRegistrations = () => {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [regs, setRegs] = useState<any[]>([]);
  const [pagination, setPagination] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRegistrations = async () => {
    setIsLoading(true);

    try {
      const res = await fetch(
        `/api/recruitment?type=event&page=${page}&limit=${LIMIT}`
      );

      if (!res.ok) {
        throw new Error("Failed to fetch");
      }

      const data = await res.json();

      setRegs(data.data ?? []);
      setPagination(data.pagination);
    } catch (error) {
      console.error(error);
      setRegs([]);
      setPagination(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [page]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Calendar className="w-5 h-5 text-blue-400" />

        <h2 className="text-lg font-bold text-white">
          Event Registrations
          <span className="ml-2 text-sm font-normal text-neutral-500">
            ({pagination?.total ?? 0})
          </span>
        </h2>
      </div>

      {regs.length === 0 ? (
        <p className="py-16 text-center text-neutral-500">
          No event registrations yet.
        </p>
      ) : (
        <div className="space-y-3">
          {regs.map((r) => (
            <div
              key={r.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div
                className="flex cursor-pointer items-center justify-between p-4 transition-all hover:bg-white/5"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>

                  <p className="text-xs text-neutral-500">
                    {r.eventName ?? r.event?.name ?? "Unknown Event"} ·{" "}
                    {r.rollNo}
                  </p>
                </div>

                {expanded === r.id ? (
                  <ChevronUp className="h-4 w-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-neutral-500" />
                )}
              </div>

              {expanded === r.id && (
                <div className="grid grid-cols-2 gap-3 border-t border-white/5 px-4 pb-4 pt-2 text-xs md:grid-cols-3">
                  {[
                    ["Email", r.personalEmail],
                    ["Phone", r.phoneNo],
                    ["Locality", r.locality],
                    [
                      "Registered",
                      new Date(r.createdAt).toLocaleDateString("en-IN"),
                    ],
                  ].map(([label, value]) => (
                    <div key={label}>
                      <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
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
    </div>
  );
};

export default AdminEventRegistrations;
