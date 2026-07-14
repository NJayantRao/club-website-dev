import { initialAchievements } from "@/data/initial-achievements";
import { useEffect, useState } from "react";
import axios from "axios";
import type { AchievementItem } from "@/lib/achievements";

interface FetchParams {
  page?: number;
  limit?: number;
  initialAchievements?: AchievementItem[];
}

interface AchievementsResponse {
  success: boolean;
  message: string;
  achievements: AchievementItem[];
}

export function useAchievements(params: FetchParams = {}) {
  const [achievements, setAchievements] = useState<AchievementItem[]>(
    params.initialAchievements ?? []
  );
  const [loading, setLoading] = useState(!params.initialAchievements?.length);
  const [error, setError] = useState<string | null>(null);

  const page = params.page ?? 1;
  const limit = params.limit ?? 10;

  useEffect(() => {
    if (params.initialAchievements?.length) {
      setAchievements(params.initialAchievements);
      setLoading(false);
      setError(null);
      return;
    }

    const fetchAchievements = async () => {
      try {
        setLoading(true);
        setError(null);

        const { data } = await axios.get<AchievementsResponse>(
          `/api/achievements?page=${page}&limit=${limit}`
        );

        setAchievements(data.achievements ?? []);
      } catch (err) {
        if (axios.isAxiosError(err)) {
          setError(err.response?.data?.message || err.message);
        } else {
          setError("Failed to fetch achievements");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchievements();
  }, [limit, page, params.initialAchievements]);

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
    loading,
    error,
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
