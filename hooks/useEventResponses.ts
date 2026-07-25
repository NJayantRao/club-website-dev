"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface EventResponseItem {
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

export function useEventResponses(
  eventId: string,
  page: number,
  limit: number
) {
  return useQuery({
    queryKey: ["events", eventId, "responses", page, limit],
    queryFn: async () => {
      const { data } = await axios.get(`/api/events/${eventId}/responses`, {
        params: { page, limit },
      });

      return {
        data: (data.data ?? []) as EventResponseItem[],
        pagination: (data.pagination ?? null) as PaginationInfo | null,
      };
    },
    placeholderData: (previous) => previous,
  });
}

interface RegistrationPayload {
  name: string;
  email: string;
  phone?: string;
  college?: string;
  answers: Record<string, string>;
}

/** Public: submit a registration for an event. */
export function useRegisterForEvent(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: RegistrationPayload) => {
      const { data } = await axios.post(
        `/api/events/${eventId}/responses`,
        payload
      );
      return data;
    },
    onSuccess: () => {
      // A new registration changes the response count shown on the admin
      // events list/single-event view, and the admin responses list itself.
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}

export function useToggleAttendance(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      responseId,
      attendance,
    }: {
      responseId: string;
      attendance: boolean;
    }) => {
      const { data } = await axios.patch(
        `/api/events/${eventId}/responses/${responseId}`,
        { attendance }
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", eventId, "responses"],
      });
    },
  });
}

export function useDeleteEventResponse(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (responseId: string) => {
      const { data } = await axios.delete(
        `/api/events/${eventId}/responses/${responseId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", eventId, "responses"],
      });
      // Deleting a response also changes the response count shown on the
      // admin events list and the single-event GET.
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
