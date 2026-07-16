"use client";

interface EventSettingsProps {
  id: string;
}

const EventSettings = ({ id }: EventSettingsProps) => {
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

            <button className="rounded-xl bg-green-500/20 px-4 py-2 text-green-300">
              Enabled
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-white/10 p-5">
            <div>
              <p className="font-medium text-white">Attendance</p>

              <p className="text-sm text-neutral-500">
                Mark attendance after the event.
              </p>
            </div>

            <button className="rounded-xl bg-white/10 px-4 py-2 text-white">
              Manage
            </button>
          </div>

          <div className="flex items-center justify-between rounded-2xl border border-red-500/30 bg-red-500/5 p-5">
            <div>
              <p className="font-medium text-red-400">Delete Event</p>

              <p className="text-sm text-red-300/70">
                Permanently remove this event.
              </p>
            </div>

            <button className="rounded-xl bg-red-500 px-5 py-2 font-semibold text-white transition hover:bg-red-600">
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EventSettings;
