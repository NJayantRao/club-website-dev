"use client";

import { useEffect, useState } from "react";
import axios from "axios";
import {
  ChevronDown,
  ChevronUp,
  CheckCircle,
  XCircle,
  Trash2,
} from "lucide-react";
import { Pagination } from "@/components/ui/Pagination";
import Popup from "./Popup";

interface EventResponsesProps {
  id: string;
}

interface EventFormFieldLite {
  name: string;
  label: string;
}

interface EventResponseItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  college: string | null;
  attendance: boolean;
  answers: Record<string, unknown>;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const LIMIT = 15;

const EventResponses = ({ id }: EventResponsesProps) => {
  const [page, setPage] = useState(1);
  const [responses, setResponses] = useState<EventResponseItem[]>([]);
  const [pagination, setPagination] = useState<PaginationInfo | null>(null);
  const [formFields, setFormFields] = useState<EventFormFieldLite[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);

  const [popup, setPopup] = useState({
    show: false,
    type: "success" as const,
    message: "",
    isConfirm: false,
    onConfirm: () => {},
  });

  const load = async (pageNum = page) => {
    setIsLoading(true);

    try {
      const [{ data: responseData }, { data: eventData }] = await Promise.all([
        axios.get(`/api/events/${id}/responses`, {
          params: { page: pageNum, limit: LIMIT },
        }),
        axios.get(`/api/events/${id}`),
      ]);

      setResponses(responseData.data ?? []);
      setPagination(responseData.pagination ?? null);
      setFormFields(eventData.event?.formFields ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load(page);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, page]);

  const toggleAttendance = async (response: EventResponseItem) => {
    try {
      await axios.patch(`/api/events/${id}/responses/${response.id}`, {
        attendance: !response.attendance,
      });
      await load(page);
    } catch (err) {
      console.error(err);
    }
  };

  const deleteResponse = async (response: EventResponseItem) => {
    try {
      await axios.delete(`/api/events/${id}/responses/${response.id}`);
      await load(page);
    } catch (err) {
      console.error(err);
    }
  };

  const confirmDelete = (response: EventResponseItem) => {
    setPopup({
      show: true,
      type: "success",
      message: `Delete the response from ${response.name}?`,
      isConfirm: true,
      onConfirm: () => {
        deleteResponse(response);
        setPopup((p) => ({ ...p, show: false }));
      },
    });
  };

  const labelFor = (fieldName: string) =>
    formFields.find((f) => f.name === fieldName)?.label ?? fieldName;

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-white/20 border-t-white" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white">
          Event Responses{" "}
          <span className="ml-2 text-sm font-normal text-neutral-500">
            ({pagination?.total ?? responses.length})
          </span>
        </h2>
      </div>

      {responses.length === 0 ? (
        <div className="flex h-72 items-center justify-center rounded-2xl border border-dashed border-white/10">
          <p className="text-neutral-500">
            No registrations yet for this event.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {responses.map((response) => (
            <div
              key={response.id}
              className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]"
            >
              <div
                className="flex cursor-pointer items-center justify-between p-4 transition hover:bg-white/5"
                onClick={() =>
                  setExpanded(expanded === response.id ? null : response.id)
                }
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`h-2 w-2 rounded-full ${
                      response.attendance ? "bg-green-500" : "bg-neutral-600"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {response.name}
                    </p>
                    <p className="text-xs text-neutral-500">{response.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAttendance(response);
                    }}
                    className={`rounded-lg px-3 py-1.5 text-xs font-bold uppercase tracking-wider transition-all ${
                      response.attendance
                        ? "bg-green-500/20 text-green-400 hover:bg-green-500/30"
                        : "bg-white/5 text-neutral-400 hover:bg-white/10"
                    }`}
                  >
                    {response.attendance ? (
                      <>
                        <CheckCircle className="mr-1 inline h-3 w-3" />
                        Attended
                      </>
                    ) : (
                      <>
                        <XCircle className="mr-1 inline h-3 w-3" />
                        Pending
                      </>
                    )}
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      confirmDelete(response);
                    }}
                    className="rounded-lg p-2 text-red-400 transition-all hover:bg-red-400/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>

                  {expanded === response.id ? (
                    <ChevronUp className="h-4 w-4 text-neutral-500" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-neutral-500" />
                  )}
                </div>
              </div>

              {expanded === response.id && (
                <div className="grid grid-cols-2 gap-3 border-t border-white/5 px-4 pb-4 pt-3 text-xs md:grid-cols-3">
                  {response.phone && (
                    <div>
                      <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                        Phone
                      </p>
                      <p className="text-neutral-300">{response.phone}</p>
                    </div>
                  )}

                  {response.college && (
                    <div>
                      <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                        College
                      </p>
                      <p className="text-neutral-300">{response.college}</p>
                    </div>
                  )}

                  {Object.entries(response.answers ?? {}).map(
                    ([key, value]) => (
                      <div key={key}>
                        <p className="mb-0.5 uppercase tracking-wider text-neutral-600">
                          {labelFor(key)}
                        </p>
                        <p className="text-neutral-300">
                          {String(value) || "—"}
                        </p>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>
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

export default EventResponses;
