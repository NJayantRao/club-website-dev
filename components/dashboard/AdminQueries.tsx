"use client";
import React, { useEffect, useState } from "react";
import { Trash2, ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";

const LIMIT = 15;

const AdminQueries: React.FC = () => {
  const [page, setPage] = useState(1);
  const [queries, setQueries] = useState<any[]>([]);
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

  const fetchQueries = async (pageNum = page) => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/recruitment?type=contact&page=${pageNum}&limit=${LIMIT}`
      );
      if (!res.ok) throw new Error("Failed to fetch");
      const data = await res.json();
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
          const res = await fetch(`/api/recruitment/${id}`, {
            method: "DELETE",
          });
          if (!res.ok) throw new Error("Delete failed");
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
          Contact Queries{" "}
          <span className="text-neutral-500 text-sm font-normal ml-2">
            ({pagination?.total ?? 0})
          </span>
        </h2>
      </div>

      {queries.length === 0 ? (
        <p className="text-neutral-500 text-center py-16">No queries yet.</p>
      ) : (
        <div className="space-y-3">
          {queries.map((q: any) => (
            <div
              key={q.id}
              className="bg-white/[0.03] border border-white/10 rounded-2xl overflow-hidden"
            >
              <div
                className="flex items-center justify-between p-4 cursor-pointer hover:bg-white/5 transition-all"
                onClick={() => setExpanded(expanded === q.id ? null : q.id)}
              >
                <div>
                  <p className="text-white font-semibold text-sm">{q.name}</p>
                  <p className="text-neutral-500 text-xs">
                    {new Date(q.createdAt).toLocaleDateString("en-IN")}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPopup({
                        show: true,
                        type: "success",
                        message: `Delete query from ${q.name}?`,
                        isConfirm: true,
                        onConfirm: () => {
                          confirmDeleteQuery(q.id, q.name);
                          setPopup((p) => ({ ...p, show: false }));
                        },
                      });
                    }}
                    className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  {expanded === q.id ? (
                    <ChevronUp className="w-4 h-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-neutral-500" />
                  )}
                </div>
              </div>
              {expanded === q.id && (
                <div className="px-4 pb-4 pt-2 border-t border-white/5 space-y-3">
                  <div className="flex flex-wrap gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Mail className="w-3 h-3" />
                      {q.personalEmail}
                    </span>
                    <span className="flex items-center gap-1.5 text-neutral-400">
                      <Phone className="w-3 h-3" />
                      {q.phoneNo}
                    </span>
                  </div>
                  <p className="text-neutral-300 text-sm leading-relaxed bg-white/5 rounded-xl p-3">
                    {q.message}
                  </p>
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

export default AdminQueries;
