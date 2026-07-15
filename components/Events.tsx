"use client";

import { useState } from "react";
import { Calendar, MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { EventItem } from "@/lib/events";
import { EventStatusType } from "@prisma/client";
import EventDetailsModal from "./ui/EventDetailModal";
import ImageCarousel from "./ui/Imagecarousal";

interface EventsProps {
  events?: EventItem[];
}

const Events = ({ events = [] }: EventsProps) => {
  const [statusFilter, setStatusFilter] = useState<
    EventStatusType | undefined
  >();

  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  const filteredEvents = statusFilter
    ? events.filter((event) => event.status === statusFilter)
    : events;

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
          {[
            undefined,
            EventStatusType.UPCOMING,
            EventStatusType.ONGOING,
            EventStatusType.COMPLETED,
          ].map((status) => (
            <button
              key={status ?? "all"}
              onClick={() => setStatusFilter(status)}
              className={`px-5 py-2 rounded-full text-sm font-semibold transition-all ${
                statusFilter === status
                  ? "bg-white text-black"
                  : "border border-white/10 text-neutral-400 hover:text-white hover:border-white/30"
              }`}
            >
              {status
                ? status.charAt(0) + status.slice(1).toLowerCase()
                : "All"}
            </button>
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <div className="text-center text-neutral-500 py-24">
            No events found.
          </div>
        ) : events.length === 0 ? (
          <div className="text-center text-neutral-500 py-24">
            No events found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((event: any) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onClick={() => setSelectedEvent(event)}
                className="group bg-white/[0.03] border border-white/10 rounded-[2rem] overflow-hidden cursor-pointer hover:border-white/20 transition-all duration-300"
              >
                <div className="h-48 overflow-hidden">
                  <ImageCarousel
                    images={event.imageUrl ? [event.imageUrl] : []}
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${event.status === EventStatusType.UPCOMING ? "bg-blue-500/20 text-blue-400" : "bg-neutral-700/50 text-neutral-400"}`}
                    >
                      {event.status.charAt(0) +
                        event.status.slice(1).toLowerCase()}
                    </span>
                    <span className="text-neutral-600 text-[10px] uppercase font-bold">
                      {event.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">
                    {event.title}
                  </h3>
                  <p className="text-neutral-500 text-sm line-clamp-2 mb-4">
                    {event.description}
                  </p>
                  <div className="flex flex-col gap-1.5 text-xs text-neutral-500">
                    <span className="flex items-center gap-2">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(event.startAt).toLocaleDateString("en-IN")}
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
