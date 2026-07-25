"use client";

import axios from "axios";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { FieldType } from "@prisma/client";

interface FieldValues {
  name: string;
  label: string;
  type: FieldType;
  required: boolean;
  placeholder: string;
}

export function useSaveEventField(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      fieldId,
      values,
      order,
    }: {
      fieldId: string | null;
      values: FieldValues;
      order?: number;
    }) => {
      if (fieldId) {
        const { data } = await axios.patch(
          `/api/events/${eventId}/form-fields/${fieldId}`,
          values
        );
        return data;
      }

      const { data } = await axios.post(`/api/events/${eventId}/form-fields`, {
        ...values,
        order,
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", "single", eventId],
      });
    },
  });
}

export function useDeleteEventField(eventId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (fieldId: string) => {
      const { data } = await axios.delete(
        `/api/events/${eventId}/form-fields/${fieldId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["events", "single", eventId],
      });
    },
  });
}
