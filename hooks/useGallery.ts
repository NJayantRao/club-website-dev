import { initialGallery } from "@/data/initial-gallery";
import { useState } from "react";

interface FetchParams {
  page?: number;
  limit?: number;
}

export function useGallery(params: FetchParams = {}) {
  const [gallery, setGallery] = useState(initialGallery);

  const page = params.page ?? 1;
  const limit = params.limit ?? gallery.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = gallery.slice(start, end);

  return {
    data: {
      data: paginated,
      pagination: {
        page,
        limit,
        total: gallery.length,
        totalPages: Math.ceil(gallery.length / limit),
        hasNextPage: end < gallery.length,
        hasPrevPage: page > 1,
      },
    },
    loading: false,
    error: null,
    setGallery,
  };
}

export function useDeleteGallery(
  setGallery: React.Dispatch<React.SetStateAction<typeof initialGallery>>
) {
  const deleteGallery = async (id: string) => {
    setGallery((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  return {
    deleteGallery,
    loading: false,
    error: null,
  };
}
