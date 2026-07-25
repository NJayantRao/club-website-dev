"use client";

import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface GalleryImage {
  id: string;
  imageUrl: string;
}

export interface GalleryAlbum {
  id: string;
  groupName: string;
  images: GalleryImage[];
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

interface FetchParams {
  page?: number;
  limit?: number;
}

export function useGallery(params: FetchParams = {}) {
  const page = params.page ?? 1;
  const limit = params.limit ?? 9;

  const query = useQuery({
    queryKey: ["gallery", page, limit],
    queryFn: async () => {
      const { data } = await axios.get("/api/gallery", {
        params: { page, limit },
      });

      return {
        data: (data.data ?? []) as GalleryAlbum[],
        pagination: (data.pagination ?? null) as PaginationInfo | null,
      };
    },
    placeholderData: (previous) => previous,
  });

  return {
    data: {
      data: query.data?.data ?? [],
      pagination: query.data?.pagination ?? null,
    },
    loading: query.isLoading,
    error: query.error ? "Failed to load gallery" : null,
  };
}

interface SaveAlbumPayload {
  albumId: string | null;
  groupName: string;
  photos: File[];
}

export function useSaveGalleryAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ albumId, groupName, photos }: SaveAlbumPayload) => {
      const fd = new FormData();
      fd.append("groupName", groupName);
      photos.forEach((f) => fd.append("photos", f));

      const url = albumId ? `/api/gallery/${albumId}` : "/api/gallery";
      const method = albumId ? "patch" : "post";

      const { data } = await axios({
        url,
        method,
        data: fd,
        headers: { "Content-Type": "multipart/form-data" },
      });

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useDeleteGalleryAlbum() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { data } = await axios.delete(`/api/gallery/${id}`);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}

export function useRemoveGalleryPhoto() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      albumId,
      imageId,
    }: {
      albumId: string;
      imageId: string;
    }) => {
      const { data } = await axios.delete(
        `/api/gallery/${albumId}/media/${imageId}`
      );
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["gallery"] });
    },
  });
}
