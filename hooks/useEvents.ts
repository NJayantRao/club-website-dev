import { initialEvents } from "@/data/initial-events";
import axios from "axios";
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

export function useEvents(params: FetchEventsParams = {}) {
  const [events, setEvents] = useState(initialEvents);

  const page = params.page ?? 1;
  const limit = params.limit ?? events.length;
  const eventType = params.eventType;

  let filteredEvents = events;

  if (params.status) {
    filteredEvents = filteredEvents.filter(
      (event) => event.status === params.status
    );
  }

  if (params.eventType) {
    filteredEvents = filteredEvents.filter(
      (event) => event.eventType === params.eventType
    );
  }

  const start = (page - 1) * limit;
  const end = start + limit;
  const paginatedEvents = filteredEvents.slice(start, end);

  return {
    data: {
      data: paginatedEvents,
      pagination: {
        page,
        limit,
        total: filteredEvents.length,
        totalPages: Math.max(1, Math.ceil(filteredEvents.length / limit)),
        hasNextPage: end < filteredEvents.length,
        hasPrevPage: page > 1,
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

      const { data } = await axios.delete(`/api/event/${id}`);

      return data.message;
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
