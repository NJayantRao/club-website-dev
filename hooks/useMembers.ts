"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Role } from "@prisma/client";

export interface Member {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: Role;
  designation: string | null;
  year: string | null;
  skills: string[];
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface MembersResponse {
  data: Member[];
  pagination: PaginationInfo;
}

interface UseMembersParams {
  role: "MEMBER" | "ADVISOR" | "ALUMNI" | "ALL";
  page?: number;
  limit?: number;
  sortBy?: string;
}

export const membersKey = (role: string) => ["members", role] as const;

export function useMembers({
  role,
  page = 1,
  limit = 12,
  sortBy = "year",
}: UseMembersParams) {
  return useQuery({
    queryKey: [...membersKey(role), page, limit, sortBy],
    queryFn: async () => {
      const { data } = await axios.get<MembersResponse>("/api/our-team", {
        params: { role, page, limit, sortBy },
      });

      return data;
    },
    placeholderData: (previous) => previous,
  });
}

export function useSaveMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      formData,
    }: {
      id: string | null;
      formData: FormData;
    }) => {
      const url = id ? `/api/members/${id}` : "/api/members";
      const method = id ? "patch" : "post";

      const { data } = await axios({
        url,
        method,
        data: formData,
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}

export function useDeleteMember() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/members/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["members"] });
    },
  });
}
