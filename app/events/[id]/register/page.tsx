"use client";

import { EventFormField } from "@prisma/client";
import axios from "axios";
import { Calendar, Clock, MapPin, Users, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

interface EventData {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  venue: string | null;
  capacity: number | null;
  startAt: Date | string;
  formFields: EventFormField[];
}

export default function RegisterEventPage() {
  const { id } = useParams<{ id: string }>();

  const [event, setEvent] = useState<EventData | null>(null);

  useEffect(() => {
    const fetchEvent = async () => {
      try {
        const { data } = await axios.get(`/api/events/${id}`);

        if (data.success) {
          setEvent(data.event);
        }
      } catch (error) {
        console.error(error);
      }
    };

    if (id) {
      fetchEvent();
    }
  }, [id]);

  if (!event) {
    return (
      <div className="min-h-screen flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  const startDate = new Date(event.startAt);

  return (
    <div className="min-h-screen bg-[#050505] px-4 pb-20 pt-24 text-white">
      <div className="mx-auto max-w-3xl">
        <Link
          href="/events"
          className="mb-8 inline-flex items-center gap-2 text-sm text-neutral-400 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Events
        </Link>

        {/* Event Card */}
        <div className="mb-8 rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
          <h1 className="mb-3 text-4xl font-bold">{event.title}</h1>

          <p className="mb-8 leading-relaxed text-neutral-400">
            {event?.description}
          </p>

          <div className="grid gap-4 text-sm text-neutral-400 sm:grid-cols-2">
            <div className="flex items-center gap-3">
              <Calendar className="h-4 w-4 text-blue-400" />
              {startDate.toLocaleDateString("en-IN")}
            </div>

            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-blue-400" />
              {startDate.toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>

            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-blue-400" />
              {event.venue}
            </div>

            <div className="flex items-center gap-3">
              <Users className="h-4 w-4 text-blue-400" />
              Capacity: {event.capacity}
            </div>
          </div>
        </div>

        <form className="space-y-8">
          {/* Personal Details */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <h2 className="mb-6 text-2xl font-semibold">Personal Details</h2>

            <div className="space-y-5">
              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Full Name *
                </label>

                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="John Doe"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Email *
                </label>

                <input
                  type="email"
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="john@example.com"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  Phone
                </label>

                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="+91 XXXXX XXXXX"
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-neutral-300">
                  College
                </label>

                <input
                  className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
                  placeholder="Your College"
                />
              </div>
            </div>
          </div>

          {/* Dynamic Fields */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <h2 className="mb-6 text-2xl font-semibold">
              Additional Information
            </h2>

            <div className="space-y-5">
              {event.formFields.map((field) => (
                <div key={field.id}>
                  <label className="mb-2 block text-sm text-neutral-300">
                    {field.label}
                    {field.required && (
                      <span className="ml-1 text-red-400">*</span>
                    )}
                  </label>

                  {field.type === "TEXTAREA" ? (
                    <textarea
                      rows={5}
                      placeholder={field.placeholder || "Enter text here"}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  ) : (
                    <input
                      placeholder={field.placeholder || "Enter text here"}
                      className="w-full rounded-xl border border-white/10 bg-black/40 px-4 py-3 outline-none transition focus:border-blue-500"
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation */}
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-8">
            <label className="flex items-start gap-3 text-sm text-neutral-300">
              <input type="checkbox" className="mt-1 accent-white" />

              <span>
                I confirm that all the information provided above is correct and
                I agree to abide by the rules of the event.
              </span>
            </label>

            <button
              type="submit"
              className="mt-8 w-full rounded-2xl bg-white py-4 text-lg font-semibold text-black transition hover:bg-neutral-200"
            >
              Register Now
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
