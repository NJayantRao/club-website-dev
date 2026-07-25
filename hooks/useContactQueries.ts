"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface ContactQuery {
  id: string;
  name: string;
  email: string;
  phoneNo: string;
  message: string;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useContactQueries(page: number, limit: number) {
  return useQuery({
    queryKey: ["contact-queries", page, limit],
    queryFn: async () => {
      const { data } = await axios.get("/api/contact-us", {
        params: { page, limit },
      });

      return {
        data: (data.data ?? []) as ContactQuery[],
        pagination: (data.pagination ?? null) as PaginationInfo | null,
      };
    },
    placeholderData: (previous) => previous,
  });
}

export function useDeleteContactQuery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/contact-us/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contact-queries"] });
    },
  });
}
