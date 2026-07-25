"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { EventStatusType, EventType, FieldType } from "@prisma/client";

export interface EventFormField {
  id: string;
  eventId: string;
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string | null;
  order: number | null;
}

export interface EventItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  status: EventStatusType;
  type: EventType;
  venue: string | null;
  startAt: string;
  endAt: string | null;
  registrationStart: string | null;
  registrationEnd: string | null;
  capacity: number | null;
  formFields?: EventFormField[];
  _count?: { responses: number };
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface UseAdminEventsParams {
  page?: number;
  limit?: number;
  type?: string;
  status?: string;
}

export function useAdminEvents({
  page = 1,
  limit = 12,
  type,
  status,
}: UseAdminEventsParams = {}) {
  return useQuery({
    queryKey: ["events", "admin-list", page, limit, type, status],
    queryFn: async () => {
      const { data } = await axios.get("/api/events", {
        params: { page, limit, type, status },
      });

      return {
        events: (data.events ?? []) as EventItem[],
        pagination: (data.pagination ?? null) as PaginationInfo | null,
      };
    },
    placeholderData: (previous) => previous,
  });
}

export function useEvent(id: string | undefined) {
  return useQuery({
    queryKey: ["events", "single", id],
    queryFn: async () => {
      const { data } = await axios.get(`/api/events/${id}`);
      return data.event as EventItem;
    },
    enabled: !!id,
  });
}

export function useSaveEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string | null;
      formData: FormData;
    }) => {
      const url = id ? `/api/events/${id}` : "/api/events";
      const method = id ? "patch" : "post";

      const { data } = await axios({
        url,
        method,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["events"] });

      if (variables.id) {
        queryClient.invalidateQueries({
          queryKey: ["events", "single", variables.id],
        });
      }
    },
  });
}

export function useDeleteEvent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/events/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["events"] });
    },
  });
}
