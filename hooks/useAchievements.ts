import { initialAchievements } from "@/data/initial-achievements";
import { useState } from "react";

interface FetchParams {
  page?: number;
  limit?: number;
}

export function useAchievements(params: FetchParams = {}) {
  const [achievements, setAchievements] = useState(initialAchievements);

  const page = params.page ?? 1;
  const limit = params.limit ?? achievements.length;

  const start = (page - 1) * limit;
  const end = start + limit;

  const paginated = achievements.slice(start, end);

  return {
    data: {
      data: paginated,
      pagination: {
        page,
        limit,
        total: achievements.length,
        totalPages: Math.ceil(achievements.length / limit),
        hasNextPage: end < achievements.length,
        hasPrevPage: page > 1,
      },
    },
    loading: false,
    error: null,
    setAchievements,
  };
}

export function useDeleteAchievement(
  setAchievements: React.Dispatch<
    React.SetStateAction<typeof initialAchievements>
  >
) {
  const deleteAchievement = async (id: string) => {
    setAchievements((prev) => prev.filter((item) => item.id !== id));
    return { success: true };
  };

  return {
    deleteAchievement,
    loading: false,
    error: null,
  };
}
