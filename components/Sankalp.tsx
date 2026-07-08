"use client";
import { useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  MapPin,
  Trophy,
  ArrowRight,
  ShieldCheck,
  Users,
  ChevronLeft,
  ChevronRight,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Pagination } from "@/components/ui/Pagination";
import { useEvents } from "@/hooks/useEvents";

const LIMIT = 6;

const ImageCarousel = ({ photos }: { photos: { imageUrl: string }[] }) => {
  const [idx, setIdx] = useState(0);
  const all = photos ?? [];
  if (!all.length)
    return (
      <div className="w-full h-full bg-indigo-500/5 flex items-center justify-center">
        <Trophy className="w-16 h-16 text-indigo-500 opacity-20" />
      </div>
    );
  return (
    <div className="relative w-full h-full group">
      <AnimatePresence mode="wait">
        <motion.img
          key={idx}
          src={all[idx].imageUrl}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.4 }}
          className="w-full h-full object-cover"
        />
      </AnimatePresence>
      {all.length > 1 && (
        <>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((p) => (p - 1 + all.length) % all.length);
            }}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIdx((p) => (p + 1) % all.length);
            }}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-black/40 backdrop-blur-md rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity z-10"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 z-10">
            {all.map((_, i) => (
              <div
                key={i}
                className={`h-1 rounded-full transition-all duration-300 ${i === idx ? "w-6 bg-indigo-500" : "w-1.5 bg-white/30"}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

const SankalpDetailsModal = ({
  event,
  onClose,
}: {
  event: any;
  onClose: () => void;
}) => {
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
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="relative w-full max-w-6xl bg-[#080808] border border-white/10 rounded-[3rem] overflow-hidden shadow-[0_0_100px_rgba(99,102,241,0.2)] flex flex-col md:flex-row max-h-[90vh]"
      >
        <button
          onClick={onClose}
          className="absolute top-6 right-6 z-10 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all"
        >
          <X className="w-6 h-6 text-white" />
        </button>
        <div className="md:w-1/2 h-64 md:h-auto flex-shrink-0 overflow-hidden">
          <ImageCarousel photos={event.images ?? []} />
        </div>
        <div className="flex-1 p-8 md:p-12 overflow-y-auto bg-gradient-to-br from-indigo-500/[0.02] to-transparent">
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`px-4 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-black border border-white/10 ${isUpcoming ? "bg-indigo-600 text-white" : "bg-neutral-800 text-neutral-300"}`}
            >
              {isUpcoming ? "Upcoming" : "Completed"}
            </span>
            {event.noOfAttendees > 0 && (
              <span className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 text-indigo-400 text-[10px] uppercase tracking-[0.2em] font-black border border-indigo-500/20">
                <Users className="w-3 h-3" />
                {event.noOfAttendees} Attendees
              </span>
            )}
          </div>
          <h2 className="text-4xl md:text-5xl font-black mb-8 leading-tight">
            {event.name}
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {[
              ["Date", new Date(event.eventDate).toLocaleDateString("en-IN")],
              [
                "Start",
                new Date(event.startTime).toLocaleTimeString("en-IN", {
                  hour: "2-digit",
                  minute: "2-digit",
                }),
              ],
              ["Venue", event.venue],
            ].map(([label, val]) => (
              <div key={label} className="space-y-1">
                <p className="text-[10px] uppercase tracking-widest text-neutral-600 font-black">
                  {label}
                </p>
                <p className="text-lg font-bold text-white">{val}</p>
              </div>
            ))}
          </div>
          {event.rules && (
            <div className="p-6 bg-white/[0.03] border border-white/5 rounded-[2rem] mb-8">
              <h4 className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.2em] text-indigo-500 mb-4">
                <ShieldCheck className="w-4 h-4" />
                Guidelines
              </h4>
              <p className="text-neutral-300 whitespace-pre-wrap text-sm leading-relaxed">
                {event.rules}
              </p>
            </div>
          )}
          {isUpcoming ? (
            <Link
              href={`/register?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`}
              className="block w-full text-center bg-indigo-600 text-white font-black py-5 rounded-3xl hover:bg-white hover:text-black transition-all duration-500 uppercase tracking-widest"
            >
              Register for Sankalp{" "}
              <ArrowRight className="w-5 h-5 inline ml-2" />
            </Link>
          ) : (
            <div className="w-full text-center bg-neutral-800/50 text-neutral-500 font-black py-5 rounded-3xl border border-white/5 uppercase">
              Registration Closed
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const SankalpCard = ({ event }: { event: any }) => {
  const isUpcoming = event.status === "upcoming";
  const [, setSelected] = useState(false);
  return (
    <div className="group relative bg-[#0a0a0a]/40 backdrop-blur-2xl border border-white/5 rounded-[2rem] overflow-hidden hover:border-indigo-500/30 hover:shadow-[0_40px_80px_-20px_rgba(99,102,241,0.3)] transition-all duration-700 flex flex-col md:flex-row md:h-[320px]">
      <div className="md:w-2/5 relative h-56 md:h-auto overflow-hidden flex-shrink-0">
        <ImageCarousel photos={event.images ?? []} />
        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0a0a0a]/60 hidden md:block" />
      </div>
      <div className="flex-1 p-6 flex flex-col">
        <div className="flex justify-between items-start mb-3 gap-4">
          <h3 className="text-xl font-black group-hover:text-indigo-400 transition-colors line-clamp-2">
            {event.name}
          </h3>
          <span
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-[10px] uppercase tracking-[0.2em] font-black border border-white/10 ${isUpcoming ? "bg-indigo-600 text-white" : "bg-neutral-800 text-neutral-300"}`}
          >
            {isUpcoming ? "Upcoming" : "Completed"}
          </span>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
          {[
            {
              icon: Calendar,
              label: "Date",
              val: new Date(event.eventDate).toLocaleDateString("en-IN"),
            },
            {
              icon: Clock,
              label: "Time",
              val: new Date(event.startTime).toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              }),
            },
            { icon: MapPin, label: "Venue", val: event.venue },
          ].map(({ icon: Icon, label, val }) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-4 h-4 text-indigo-500" />
              </div>
              <div>
                <p className="text-[8px] uppercase tracking-widest text-neutral-600 font-black">
                  {label}
                </p>
                <p className="text-[10px] font-bold text-white truncate">
                  {val}
                </p>
              </div>
            </div>
          ))}
        </div>
        {event.rules && (
          <div className="bg-white/[0.03] border border-white/5 rounded-xl p-3 mb-4 flex-1 overflow-hidden">
            <h4 className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-indigo-500 mb-2">
              <ShieldCheck className="w-3 h-3" />
              Guidelines
            </h4>
            <p className="text-neutral-400 text-xs line-clamp-3">
              {event.rules}
            </p>
          </div>
        )}
        <div className="flex items-center justify-between mt-auto">
          {event.noOfAttendees > 0 && !isUpcoming && (
            <span className="flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px]">
              <Users className="w-4 h-4" />
              {event.noOfAttendees} Attendees
            </span>
          )}
          {isUpcoming ? (
            <Link
              href={`/register?eventId=${event.id}&eventName=${encodeURIComponent(event.name)}`}
              className="ml-auto flex items-center gap-2 text-indigo-400 font-black uppercase text-[10px] hover:gap-4 transition-all"
            >
              Register <ArrowRight className="w-4 h-4" />
            </Link>
          ) : (
            <span className="ml-auto text-neutral-600 text-[10px] font-black uppercase">
              Completed
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

const Sankalp = () => {
  const [page, setPage] = useState(1);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const { data, loading } = useEvents({
    page,
    limit: LIMIT,
    eventType: "sankalp",
  });
  const events = data?.data ?? [];
  const pagination = data?.pagination;

  const upcoming = events.filter((e: any) => e.status === "upcoming");
  const past = events.filter((e: any) => e.status !== "upcoming");

  return (
    <div className="pt-32 pb-40 px-6 max-w-7xl mx-auto min-h-screen">
      <div className="text-center mb-24">
        <h1 className="text-5xl md:text-8xl font-black tracking-[-0.05em] text-white mb-8 uppercase">
          Sankalp<span className="text-indigo-600">.</span>
        </h1>
        <p className="text-neutral-500 max-w-3xl mx-auto text-xl font-medium leading-relaxed">
          The ultimate arena where innovation meets execution.
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-40 gap-8">
          <div className="relative">
            <div className="w-24 h-24 border-4 border-indigo-500/10 rounded-full" />
            <div className="w-24 h-24 border-t-4 border-indigo-500 rounded-full animate-spin absolute top-0 left-0 shadow-[0_0_30px_rgba(99,102,241,0.4)]" />
          </div>
          <p className="text-indigo-400 font-black uppercase tracking-[0.5em] text-xs animate-pulse ml-4">
            Loading...
          </p>
        </div>
      ) : (
        <div className="space-y-24">
          {upcoming.length > 0 && (
            <section>
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-3xl font-bold uppercase tracking-tighter">
                  Upcoming Events
                </h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-indigo-500/50 to-transparent" />
              </div>
              <div className="space-y-6">
                {upcoming.map((ev: any) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="cursor-pointer"
                  >
                    <SankalpCard event={ev} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {past.length > 0 && (
            <section>
              <div className="flex items-center gap-6 mb-10">
                <h2 className="text-3xl font-bold uppercase tracking-tighter text-neutral-500">
                  Past Events
                </h2>
                <div className="h-[2px] flex-1 bg-gradient-to-r from-white/10 to-transparent" />
              </div>
              <div className="space-y-6">
                {past.map((ev: any) => (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEvent(ev)}
                    className="cursor-pointer"
                  >
                    <SankalpCard event={ev} />
                  </div>
                ))}
              </div>
            </section>
          )}
          {events.length === 0 && (
            <div className="text-center text-neutral-500 py-24">
              No Sankalp events yet.
            </div>
          )}
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

      <AnimatePresence>
        {selectedEvent && (
          <SankalpDetailsModal
            event={selectedEvent}
            onClose={() => setSelectedEvent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default Sankalp;
