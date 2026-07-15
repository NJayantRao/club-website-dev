"use client";
import React, { useState } from "react";
import { Calendar, MapPin, Users } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
// Replace missing useAdminList hook with local loader
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

const LIMIT = 10;

const AdminSankalpEvents = () => {
  const [page, setPage] = useState(1);
  const {
    data: events,
    pagination,
    isLoading,
  } = useAdminList(`/api/event?eventType=sankalp&page=${page}&limit=${LIMIT}`);

  if (isLoading)
    return (
      <div className="flex justify-center py-20">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-bold text-white">
        Sankalp Events{" "}
        <span className="text-neutral-500 text-sm font-normal ml-2">
          ({pagination?.total ?? 0})
        </span>
      </h2>
      <div className="space-y-3">
        {events.map((ev: any) => (
          <div
            key={ev.id}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-4">
              {ev.images?.[0] && (
                <img
                  src={ev.images[0].imageUrl}
                  alt=""
                  className="w-16 h-16 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div>
                <p className="text-white font-semibold">{ev.name}</p>
                <div className="flex flex-wrap gap-3 text-neutral-500 text-xs mt-1">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(ev.eventDate).toLocaleDateString("en-IN")}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {ev.venue}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    Capacity: {ev.capacity}
                  </span>
                </div>
                <p className="text-neutral-600 text-xs mt-2 line-clamp-2">
                  {ev.description}
                </p>
              </div>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-neutral-500 text-center py-16">
            No Sankalp events yet.
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
    </div>
  );
};

export default AdminSankalpEvents;
