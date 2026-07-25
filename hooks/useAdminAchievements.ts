"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { AchievementType } from "@prisma/client";

export interface AdminAchievement {
  id: string;
  title: string;
  description: string | null;
  achievedAt: string;
  tag: AchievementType;
  imageUrl: string | null;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export function useAdminAchievements(page: number, limit: number) {
  return useQuery({
    queryKey: ["achievements", "admin-list", page, limit],
    queryFn: async () => {
      const { data } = await axios.get("/api/achievements", {
        params: { page, limit },
      });

      return {
        data: (data.data ?? []) as AdminAchievement[],
        pagination: (data.pagination ?? null) as PaginationInfo | null,
      };
    },
    placeholderData: (previous) => previous,
  });
}

interface CreatePayload {
  title: string;
  description: string;
  tag: string;
  achievedAt: string;
  image?: File;
}

interface UpdatePayload {
  title: string;
  description: string;
  tag: string;
  achievedAt: string;
}

export function useCreateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreatePayload) => {
      const fd = new FormData();
      fd.append("title", payload.title);
      fd.append("description", payload.description);
      fd.append("tag", payload.tag);
      fd.append("achievedAt", payload.achievedAt);
      if (payload.image) fd.append("image", payload.image);

      const { data } = await axios.post("/api/achievements", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

export function useUpdateAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdatePayload;
    }) => {
      const { data } = await axios.patch(`/api/achievements/${id}`, {
        title: payload.title,
        description: payload.description,
        tag: payload.tag,
        achievedAt: new Date(payload.achievedAt).toISOString(),
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}

export function useDeleteAchievement() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/achievements/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["achievements"] });
    },
  });
}
