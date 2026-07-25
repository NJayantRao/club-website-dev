"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface RecruitmentApplication {
  id: string;
  name: string;
  rollNo: string;
  instituteEmail: string;
  personalEmail: string;
  gender: string;
  branch: string;
  phoneNo: string;
  locality: string;
  techStack: string;
  isSelected: boolean;
  createdAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface RecruitmentSubmission {
  name: string;
  rollNo: string;
  instituteEmail: string;
  personalEmail: string;
  gender: string;
  branch: string;
  phoneNo: string;
  locality: string;
  techStack: string;
}

/** Public application form submission. */
export function useSubmitRecruitment() {
  const mutation = useMutation({
    mutationFn: async (payload: RecruitmentSubmission) => {
      try {
        const { data } = await axios.post("/api/recruitment", payload);
        return data;
      } catch (err) {
        const message = axios.isAxiosError(err)
          ? (err.response?.data?.message ?? err.message ?? "Submission failed")
          : "Submission failed";

        throw new Error(message);
      }
    },
  });

  return {
    submitRecruitment: mutation.mutateAsync,
    loading: mutation.isPending,
    error: mutation.error,
  };
}

/** Admin: paginated list of applications. */
export function useAdminRecruitment(page: number, limit: number) {
  return useQuery({
    queryKey: ["recruitment", "admin-list", page, limit],
    queryFn: async () => {
      const { data } = await axios.get("/api/recruitment", {
        params: { page, limit },
      });

      return {
        data: (data.data ?? []) as RecruitmentApplication[],
        pagination: (data.pagination ?? null) as PaginationInfo | null,
      };
    },
    placeholderData: (previous) => previous,
  });
}

export function useUpdateRecruitmentSelection() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      isSelected,
    }: {
      id: string;
      isSelected: boolean;
    }) => {
      const { data } = await axios.put(`/api/recruitment/${id}`, {
        isSelected,
      });
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment"] });
    },
  });
}

export function useDeleteRecruitmentApplication() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/recruitment/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment"] });
    },
  });
}

export function useClearAllRecruitment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await axios.delete("/api/recruitment");
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recruitment"] });
    },
  });
}
