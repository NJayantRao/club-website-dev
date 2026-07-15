"use client";
import React, { useState } from "react";
import { Plus, Edit2, Trash2, X, Calendar, MapPin, Users } from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "../ui/Popup";
// Local simple list loader replaced useAdminList hook
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

  return { data, pagination, isLoading, refetch: fetchData } as const;
};

// Simple validation to replace adminValidation
type FieldErrors = Record<string, string>;
type EventFormData = any;
const validateEvent = (f: EventFormData) => {
  const errs: FieldErrors = {};
  if (!f.name) errs.name = "Name is required";
  if (!f.venue) errs.venue = "Venue is required";
  return errs;
};

const LIMIT = 10;
const EVENT_TYPES = ["general", "sankalp", "workshop", "hackathon"] as const;
const STATUSES = ["upcoming", "completed"] as const;

const EMPTY_FORM: EventFormData = {
  name: "",
  venue: "",
  description: "",
  eventDate: "",
  startTime: "",
  endTime: "",
  registrationCloseAt: "",
  eventType: "general",
  status: "upcoming",
  capacity: 100,
  maxTeamSize: "",
  rules: "",
};

const inputClass = (hasError: boolean) =>
  `w-full bg-white/5 border rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition-all ${hasError ? "border-red-500/50" : "border-white/10 focus:border-white/20"}`;

const AdminEvents = () => {
  const [page, setPage] = useState(1);
  const {
    data: events,
    pagination,
    isLoading,
    refetch,
  } = useAdminList(`/api/event?page=${page}&limit=${LIMIT}`);

  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<EventFormData>(EMPTY_FORM);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [photoFiles, setPhotoFiles] = useState<File[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const updateField = (key: keyof EventFormData, value: string | number) =>
    setForm((f: EventFormData) => ({ ...f, [key]: value }));

  const openAdd = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setEditId(null);
    setPhotoFiles([]);
    setShowModal(true);
  };

  const openEdit = (ev: any) => {
    setEditId(ev.id);
    setErrors({});
    setForm({
      name: ev.name ?? "",
      venue: ev.venue ?? "",
      description: ev.description ?? "",
      eventDate: ev.eventDate ? ev.eventDate.slice(0, 16) : "",
      startTime: ev.startTime ? ev.startTime.slice(0, 16) : "",
      endTime: ev.endTime ? ev.endTime.slice(0, 16) : "",
      registrationCloseAt: ev.registrationCloseAt
        ? ev.registrationCloseAt.slice(0, 16)
        : "",
      eventType: ev.eventType ?? "general",
      status: ev.status ?? "upcoming",
      capacity: ev.capacity ?? 100,
      maxTeamSize: ev.maxTeamSize ?? "",
      rules: ev.rules ?? "",
    });
    setPhotoFiles([]);
    setShowModal(true);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateEvent(form);
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length > 0) return;

    setIsSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v !== undefined && v !== null && v !== "") fd.append(k, String(v));
      });
      photoFiles.forEach((f) => fd.append("photos", f));

      const url = editId ? `/api/event/${editId}` : "/api/event";
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        body: fd,
      });
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message);
      }

      setShowModal(false);
      setForm(EMPTY_FORM);
      setPhotoFiles([]);
      setEditId(null);
      refetch();
      setPopup({
        show: true,
        type: "success",
        message: editId ? "Event updated!" : "Event created!",
        isConfirm: false,
        onConfirm: () => {},
      });
    } catch (err: any) {
      setPopup({
        show: true,
        type: "success",
        message: err.message ?? "Something went wrong.",
        isConfirm: false,
        onConfirm: () => {},
      });
    } finally {
      setIsSaving(false);
    }
  };

  const deleteEvent = async (id: string) => {
    try {
      const res = await fetch(`/api/event/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Delete failed");
      refetch();
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (id: string, name: string) =>
    setPopup({
      show: true,
      type: "success",
      message: `Delete "${name}"?`,
      isConfirm: true,
      onConfirm: () => {
        deleteEvent(id);
        setPopup((p) => ({ ...p, show: false }));
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
          Events{" "}
          <span className="text-neutral-500 text-sm font-normal ml-2">
            ({pagination?.total ?? 0})
          </span>
        </h2>
        <button
          onClick={openAdd}
          className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all"
        >
          <Plus className="w-4 h-4" /> Add Event
        </button>
      </div>

      <div className="space-y-3">
        {events.map((ev: any) => (
          <div
            key={ev.id}
            className="bg-white/[0.03] border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-4 hover:border-white/20 transition-all"
          >
            <div className="flex items-center gap-4 min-w-0">
              {ev.images?.[0] && (
                <img
                  src={ev.images[0].imageUrl}
                  alt=""
                  className="w-12 h-12 rounded-xl object-cover flex-shrink-0"
                />
              )}
              <div className="min-w-0">
                <p className="text-white font-semibold text-sm truncate">
                  {ev.name}
                </p>
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
                    Cap: {ev.capacity}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <span
                className={`px-2 py-1 rounded-lg text-[10px] font-bold uppercase ${ev.status === "upcoming" ? "bg-blue-500/20 text-blue-400" : "bg-neutral-700/50 text-neutral-400"}`}
              >
                {ev.status}
              </span>
              <span className="px-2 py-1 rounded-lg bg-white/5 text-neutral-400 text-[10px] uppercase">
                {ev.eventType}
              </span>
              <button
                onClick={() => openEdit(ev)}
                className="p-2 text-neutral-400 hover:text-white hover:bg-white/10 rounded-lg transition-all"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button
                onClick={() => confirmDelete(ev.id, ev.name)}
                className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-all"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
        {events.length === 0 && (
          <p className="text-neutral-500 text-center py-16">No events yet.</p>
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

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0A0A0A] border border-white/10 rounded-3xl w-full max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-bold text-white">
                {editId ? "Edit Event" : "Create Event"}
              </h3>
              <button
                onClick={() => setShowModal(false)}
                className="p-2 text-neutral-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Event Name
                  </label>
                  <input
                    className={inputClass(!!errors.name)}
                    value={form.name}
                    onChange={(e) => updateField("name", e.target.value)}
                  />
                  {errors.name && (
                    <p className="text-red-400 text-xs mt-1">{errors.name}</p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Venue
                  </label>
                  <input
                    className={inputClass(!!errors.venue)}
                    value={form.venue}
                    onChange={(e) => updateField("venue", e.target.value)}
                  />
                  {errors.venue && (
                    <p className="text-red-400 text-xs mt-1">{errors.venue}</p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  className={inputClass(!!errors.description) + " resize-none"}
                  value={form.description}
                  onChange={(e) => updateField("description", e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Event Date
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass(!!errors.eventDate)}
                    value={form.eventDate}
                    onChange={(e) => updateField("eventDate", e.target.value)}
                  />
                  {errors.eventDate && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.eventDate}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Start Time
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass(!!errors.startTime)}
                    value={form.startTime}
                    onChange={(e) => updateField("startTime", e.target.value)}
                  />
                  {errors.startTime && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.startTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    End Time
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass(!!errors.endTime)}
                    value={form.endTime}
                    onChange={(e) => updateField("endTime", e.target.value)}
                  />
                  {errors.endTime && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.endTime}
                    </p>
                  )}
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Registration Closes
                  </label>
                  <input
                    type="datetime-local"
                    className={inputClass(!!errors.registrationCloseAt)}
                    value={form.registrationCloseAt}
                    onChange={(e) =>
                      updateField("registrationCloseAt", e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Type
                  </label>
                  <select
                    className={inputClass(false)}
                    value={form.eventType}
                    onChange={(e) => updateField("eventType", e.target.value)}
                  >
                    {EVENT_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Status
                  </label>
                  <select
                    className={inputClass(false)}
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value)}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Capacity
                  </label>
                  <input
                    type="number"
                    className={inputClass(!!errors.capacity)}
                    value={form.capacity}
                    onChange={(e) =>
                      updateField(
                        "capacity",
                        e.target.value === "" ? "" : Number(e.target.value)
                      )
                    }
                  />
                  {errors.capacity && (
                    <p className="text-red-400 text-xs mt-1">
                      {errors.capacity}
                    </p>
                  )}
                </div>
                {form.eventType === "hackathon" && (
                  <div>
                    <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                      Max Team Size
                    </label>
                    <input
                      type="number"
                      className={inputClass(!!errors.maxTeamSize)}
                      value={form.maxTeamSize}
                      onChange={(e) =>
                        updateField(
                          "maxTeamSize",
                          e.target.value === "" ? "" : Number(e.target.value)
                        )
                      }
                    />
                    {errors.maxTeamSize && (
                      <p className="text-red-400 text-xs mt-1">
                        {errors.maxTeamSize}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {(form.eventType === "sankalp" ||
                form.eventType === "hackathon" ||
                form.eventType === "workshop") && (
                <div>
                  <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                    Rules
                  </label>
                  <textarea
                    rows={3}
                    className={inputClass(false) + " resize-none"}
                    value={form.rules}
                    onChange={(e) => updateField("rules", e.target.value)}
                  />
                </div>
              )}

              <div>
                <label className="text-[10px] uppercase tracking-widest text-neutral-500 font-black block mb-1">
                  Photos
                </label>
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  className="w-full text-neutral-400 text-sm"
                  onChange={(e) =>
                    setPhotoFiles(Array.from(e.target.files ?? []))
                  }
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-3 border border-white/10 rounded-xl text-neutral-400 hover:text-white transition-all text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="flex-1 py-3 bg-white text-black rounded-xl font-semibold text-sm hover:bg-neutral-200 transition-all disabled:opacity-50"
                >
                  {isSaving
                    ? "Saving..."
                    : editId
                      ? "Update Event"
                      : "Create Event"}
                </button>
              </div>
            </form>
          </div>
        </div>
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

export default AdminEvents;
