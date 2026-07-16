"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import { CalendarDays, MapPin, Users, Tag } from "lucide-react";

interface EventOverviewProps {
  id: string;
}

const EventOverview = ({ id }: EventOverviewProps) => {
  const [event, setEvent] = useState<any>(null);

  const [isLoading, setIsLoading] = useState(true);

  const fetchEvent = async () => {
    setIsLoading(true);

    try {
      const { data } = await axios.get(`/api/events/${id}`);

      setEvent(data.event);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEvent();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="rounded-2xl border border-white/10 bg-[#111] p-8 text-center text-neutral-500">
        Event not found.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Banner */}

      <div className="overflow-hidden rounded-3xl border border-white/10">
        <img
          src={event.imageUrl ?? "/placeholder.jpg"}
          alt={event.title}
          className="h-72 w-full object-cover"
        />
      </div>

      {/* Info */}

      <div className="rounded-3xl border border-white/10 bg-[#111] p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:justify-between">
          <div className="space-y-4">
            <div>
              <h2 className="text-3xl font-bold text-white">{event.title}</h2>

              <p className="mt-3 max-w-3xl text-neutral-400">
                {event.description || "No description provided."}
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="rounded-full bg-white/10 px-4 py-2 text-sm text-neutral-300">
                {event.type}
              </span>

              <span
                className={`rounded-full px-4 py-2 text-sm ${
                  event.status === "UPCOMING"
                    ? "bg-blue-500/20 text-blue-300"
                    : event.status === "ONGOING"
                      ? "bg-green-500/20 text-green-300"
                      : event.status === "COMPLETED"
                        ? "bg-neutral-500/20 text-neutral-300"
                        : "bg-red-500/20 text-red-300"
                }`}
              >
                {event.status}
              </span>
            </div>
          </div>

          <button className="h-fit rounded-xl bg-white px-5 py-3 font-semibold text-black transition hover:bg-neutral-200">
            Edit Event
          </button>
        </div>

        <div className="mt-10 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <CalendarDays className="mb-3 h-6 w-6 text-blue-400" />

            <p className="text-sm text-neutral-500">Starts</p>

            <p className="mt-1 text-white">
              {new Date(event.startAt).toLocaleString()}
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <MapPin className="mb-3 h-6 w-6 text-green-400" />

            <p className="text-sm text-neutral-500">Venue</p>

            <p className="mt-1 text-white">{event.venue || "Not specified"}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <Users className="mb-3 h-6 w-6 text-orange-400" />

            <p className="text-sm text-neutral-500">Capacity</p>

            <p className="mt-1 text-white">{event.capacity ?? "Unlimited"}</p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
            <Tag className="mb-3 h-6 w-6 text-pink-400" />

            <p className="text-sm text-neutral-500">Registration Ends</p>

            <p className="mt-1 text-white">
              {event.registrationEnd
                ? new Date(event.registrationEnd).toLocaleString()
                : "Not configured"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventOverview;
