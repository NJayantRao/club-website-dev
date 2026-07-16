"use client";

import EventOverview from "@/components/EventOverview";
import EventAnalytics from "@/components/ui/EventAnalytics";
import EventFields from "@/components/ui/EventFields";
import EventResponses from "@/components/ui/EventResponses";
import EventSettings from "@/components/ui/EventSettings";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

const tabs = [
  "overview",
  "fields",
  "responses",
  "analytics",
  "settings",
] as const;

type Tab = (typeof tabs)[number];

const isTab = (value: string | null): value is Tab =>
  !!value && (tabs as readonly string[]).includes(value);

function EventManagementContent() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();

  const initialTab = searchParams.get("tab");

  const [tab, setTab] = useState<Tab>(
    isTab(initialTab) ? initialTab : "overview"
  );

  return (
    <div className="space-y-8">
      {/* Back to Dashboard */}

      <Link
        href="/dashboard?tab=events"
        className="inline-flex items-center gap-2 text-sm font-medium text-neutral-400 transition hover:text-white"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      {/* Header */}

      <div>
        <h1 className="text-3xl font-bold text-white">Event Management</h1>

        <p className="mt-2 text-neutral-500">Event ID : {id}</p>
      </div>

      {/* Tabs */}

      <div className="flex flex-wrap gap-3">
        {tabs.map((item) => (
          <button
            key={item}
            onClick={() => setTab(item)}
            className={`rounded-xl px-5 py-2 text-sm font-medium transition ${
              tab === item
                ? "bg-white text-black"
                : "border border-white/10 bg-white/5 text-neutral-400 hover:border-white/20 hover:text-white"
            }`}
          >
            {item.charAt(0).toUpperCase() + item.slice(1)}
          </button>
        ))}
      </div>

      {/* Body */}

      {tab === "overview" && <EventOverview id={id} />}

      {tab === "fields" && <EventFields id={id} />}

      {tab === "responses" && <EventResponses id={id} />}

      {tab === "analytics" && <EventAnalytics id={id} />}

      {tab === "settings" && <EventSettings id={id} />}
    </div>
  );
}

export default function EventManagementPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-[50vh] items-center justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
        </div>
      }
    >
      <EventManagementContent />
    </Suspense>
  );
}
