"use client";
import React, { useState } from "react";
import { Trophy, ChevronDown, ChevronUp } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
// Local useAdminList to avoid missing-hook errors
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

  return { data, pagination, isLoading } as const;
};

const LIMIT = 15;

const AdminSankalpRegistrations = () => {
  const [page, setPage] = useState(1);
  const [expanded, setExpanded] = useState<string | null>(null);
  const {
    data: regs,
    pagination,
    isLoading,
  } = useAdminList(
    `/api/recruitment?type=event&page=${page}&limit=${LIMIT}&eventType=sankalp`
  );

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Trophy className="w-5 h-5 text-yellow-400" />
        <h2 className="text-lg font-bold text-white">
          Sankalp Registrations{" "}
          <span className="text-neutral-500 text-sm font-normal ml-2">
            ({pagination?.total ?? 0})
          </span>
        </h2>
      </div>

      {regs.length === 0 ? (
        <p className="text-neutral-500 text-center py-16">
          No Sankalp registrations yet.
        </p>
      ) : (
        <div className="space-y-3">
          {regs.map((r: any) => (
            <div
              key={r.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => setExpanded(expanded === r.id ? null : r.id)}
              >
                <div>
                  <p className="text-white font-semibold text-sm">{r.name}</p>
                  <p className="text-neutral-500 text-xs">
                    {r.rollNo} · {r.eventName ?? r.event?.name}
                  </p>
                </div>
                {expanded === r.id ? (
                  <ChevronUp className="w-4 h-4 text-neutral-500" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neutral-500" />
                )}
              </div>
              {expanded === r.id && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 grid grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                  {[
                    ["Email", r.personalEmail],
                    ["Phone", r.phoneNo],
                    ["Locality", r.locality],
                    ["Date", new Date(r.createdAt).toLocaleDateString("en-IN")],
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
    </div>
  );
};

export default AdminSankalpRegistrations;
