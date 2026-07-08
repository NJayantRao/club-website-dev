import { initialEvents } from "@/data/initial-events";
import { useState } from "react";

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

export interface EventsResponse {
  data: any[];
  pagination: PaginationMeta;
}

interface FetchEventsParams {
  page?: number;
  limit?: number;
  status?: string;
  eventType?: string;
}

const fetchEvents = async (): Promise<EventsResponse> => {
  // simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return {
    data: initialEvents,
    pagination: {
      page: 1,
      limit: 6,
      total: 6,
      totalPages: 1,
      hasNextPage: false,
      hasPrevPage: false,
    },
  };
};

export function useEvents() {
  const [events, setEvents] = useState(initialEvents);

  return {
    data: {
      data: events,
      pagination: {
        page: 1,
        limit: events.length,
        total: events.length,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      },
    },
    loading: false,
    error: null,
    setEvents,
  };
}

export function useDeleteEvent() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const deleteEvent = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const res = await fetch(`/api/event/${id}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        throw new Error("Failed to delete event");
      }

      return await res.json();
    } catch (err) {
      setError(err as Error);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteEvent,
    loading,
    error,
  };
}
