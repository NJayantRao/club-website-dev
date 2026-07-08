"use client";
import React, { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  Users,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEvents } from "@/hooks/useEvents";
import { Pagination } from "@/components/ui/Pagination";

const LIMIT = 9;

const ImageCarousel = ({ photos }: { photos: { imageUrl: string }[] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  if (!photos || photos.length === 0)
    return (
      <div className="w-full h-full bg-white/5 flex items-center justify-center rounded-[2rem]">
        <Calendar className="w-12 h-12 text-blue-500 opacity-20" />
      </div>
    );

  return (
    <div className="relative w-full h-full group">
      <AnimatePresence mode="wait">
        <motion.img
          key={currentIndex}
          src={photos[currentIndex].imageUrl}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover rounded-[2rem]"
        />
      </AnimatePresence>
      {photos.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((p) => (p - 1 + photos.length) % photos.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex((p) => (p + 1) % photos.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </>
      )}
    </div>
  );
};

const EventDetailsModal = ({
  event,
  onClose,
}: {
  event: any;
  onClose: () => void;
}) => {
  if (!event) return null;
  const isUpcoming = event.status === "upcoming";
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8"
    >
      <div
        className="absolute inset-0 bg-black/90 backdrop-blur-xl"
        onClick={onClose}
      />
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="relative z-10 bg-[#0A0A0A] border border-white/10 rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 md:p-8"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-neutral-400"
        >
          <X className="w-5 h-5" />
        </button>
        <div className="h-48 rounded-2xl overflow-hidden mb-6">
          <ImageCarousel photos={event.images || []} />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">{event.name}</h2>
        <div className="flex flex-wrap gap-2 mb-4">
          <span
            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${isUpcoming ? "bg-blue-500/20 text-blue-400" : "bg-neutral-500/20 text-neutral-400"}`}
          >
            {event.status}
          </span>
          <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-white/5 text-neutral-300">
            {event.eventType}
          </span>
        </div>
        <p className="text-neutral-400 text-sm leading-relaxed mb-6">
          {event.description}
        </p>
        <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
          <div className="flex items-center gap-2 text-neutral-400">
            <Calendar className="w-4 h-4 text-blue-400" />
            {new Date(event.eventDate).toLocaleDateString("en-IN")}
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <Clock className="w-4 h-4 text-blue-400" />
            {new Date(event.startTime).toLocaleTimeString("en-IN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <MapPin className="w-4 h-4 text-blue-400" />
            {event.venue}
          </div>
          <div className="flex items-center gap-2 text-neutral-400">
            <Users className="w-4 h-4 text-blue-400" />
            Capacity: {event.capacity}
          </div>
        </div>
        {event.rules && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-white mb-2">Rules</h3>
            <p className="text-neutral-400 text-sm">{event.rules}</p>
          </div>
        )}
        {isUpcoming && (
          <Link
            href={`/register?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`}
            className="block w-full text-center bg-white text-black font-bold py-4 rounded-2xl hover:bg-neutral-200 transition-all"
          >
            Register Now
          </Link>
        )}
      </motion.div>
    </motion.div>
  );
};

const Events = () => {
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string | undefined>(
    undefined
  );
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data, loading } = useEvents({
    page,
    limit: LIMIT,
    status: statusFilter,
  });
  const events = data?.data ?? [];
  const pagination = data?.pagination;

  return (
    <div className="min-h-screen bg-[#050505] text-white pt-24 pb-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">Events</h1>
          <p className="text-neutral-400 max-w-xl mx-auto">
            Explore our workshops, hackathons, and flagship events.
          </p>
        </div>

        {/* Filter */}
        <div className="flex gap-3 justify-center mb-10">
          {[undefined, "upcoming", "completed"].map((s) => (
            <button
              key={s ?? "all"}
              onClick={() => {
                setStatusFilter(s);
                setPage(1);
              }}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${statusFilter === s ? "bg-white text-black" : "border border-white/10 text-neutral-400 hover:text-white hover:border-white/30"}`}
            >
              {s ? s.charAt(0).toUpperCase() + s.slice(1) : "All"}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-[2rem] h-64 animate-pulse"
              />
            ))}
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-neutral-500 py-24">
            No events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event: any) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedEvent(event)}
                className="group bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <ImageCarousel photos={event.images || []} />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === "upcoming" ? "bg-blue-500/20 text-blue-400" : "bg-neutral-700/50 text-neutral-400"}`}
                    >
                      {event.status}
                    </span>
                    <span className="text-neutral-600 text-[10px] uppercase font-bold">
                      {event.eventType}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {event.name}
                  </h3>
                  <p className="text-neutral-500 text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>
                  <div className="flex flex-col gap-1.5 text-xs text-neutral-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.eventDate).toLocaleDateString("en-IN")}
                    </span>
                    <span className="flex items-center gap-2">
                      <MapPin className="w-3.5 h-3.5" />
                      {event.venue}
                    </span>
                  </div>
                </div>
              </motion.div>
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

      <AnimatePresence>
        {selectedEvent && (
          <EventDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Events;
