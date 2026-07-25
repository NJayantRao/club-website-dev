"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useEvent, useSaveEvent, useDeleteEvent } from "@/hooks/useEvents";

interface EventSettingsProps {
  id: string;
}

const EventSettings = ({ id }: EventSettingsProps) => {
  const router = useRouter();

  const { data: event, isLoading: loadingStatus } = useEvent(id);

  // NOTE: `registrationEnabled` isn't a field on the Event model (it only
  // has registrationStart/registrationEnd dates) — this toggle was already
  // a no-op before this refactor. Left as-is to avoid scope creep; flagging
  // it here rather than silently leaving it unexplained.
  const registrationEnabled =
    (event as unknown as { registrationEnabled?: boolean })
      ?.registrationEnabled ?? true;

  const saveEvent = useSaveEvent();
  const deleteEvent = useDeleteEvent();

  const [deleting, setDeleting] = useState(false);

  async function handleToggleRegistration() {
    const next = !registrationEnabled;

    try {
      const formData = new FormData();
      formData.append("registrationEnabled", String(next));

      await saveEvent.mutateAsync({ id, formData });
    } catch (error) {
      console.error(error);
      alert("Failed to update registration status.");
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "This will permanently delete this event and cannot be undone. Are you sure?"
    );

    if (!confirmed) return;

    setDeleting(true);

    try {
      await deleteEvent.mutateAsync(id);
      router.push("/dashboard?tab=events");
    } catch (error) {
      console.error(error);
      alert("Failed to delete event.");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Settings</h2>

      <div className="rounded-3xl border border-white/10 bg-[#111] p-8">
        <h3 className="text-lg font-semibold text-white">Event Settings</h3>

        <div className="mt-8 space-y-5">
          <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
            <div>
              <p className="font-medium text-white">Registration</p>

              <p className="text-sm text-neutral-500">
                Enable or disable registrations.
              </p>
            </div>

            <button
              onClick={handleToggleRegistration}
              disabled={loadingStatus || saveEvent.isPending}
              className={`flex items-center gap-2 rounded-xl px-4 py-2 font-medium transition disabled:cursor-not-allowed disabled:opacity-60 ${
                registrationEnabled
                  ? "bg-green-500/20 text-green-300 hover:bg-green-500/30"
                  : "bg-white/10 text-neutral-300 hover:bg-white/20"
              }`}
            >
              {saveEvent.isPending && (
                <Loader2 size={16} className="animate-spin" />
              )}
              {loadingStatus
                ? "Loading..."
                : registrationEnabled
                  ? "Enabled"
                  : "Disabled"}
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
            <div>
              <p className="font-medium text-red-400">Delete Event</p>

              <p className="text-sm text-red-300/70">
                Permanently remove this event.
              </p>
            </div>

            <button
              onClick={handleDelete}
              disabled={deleting}
              className="flex items-center gap-2 rounded-xl bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {deleting && <Loader2 size={16} className="animate-spin" />}
              {deleting ? "Deleting..." : "Delete"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSettings;
