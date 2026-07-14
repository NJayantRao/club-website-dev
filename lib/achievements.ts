import prisma from "@/lib/prisma";
import { unstable_cache } from "next/cache";

export interface AchievementItem {
  id: string;
  title: string;
  description: string;
  achievedAt: string;
  achievementTag: string;
  images: Array<{ imageUrl: string }>;
}

export const getAchievements = unstable_cache(
  async (): Promise<AchievementItem[]> => {
    const achievements = await prisma.achievement.findMany({
      orderBy: {
        achievedAt: "desc",
      },
      select: {
        id: true,
        title: true,
        description: true,
        achievedAt: true,
        imageUrl: true,
        tag: true,
      },
    });

    return achievements.map((achievement) => ({
      id: achievement.id,
      title: achievement.title,
      description: achievement.description ?? "",
      achievedAt: achievement.achievedAt.toISOString(),
      achievementTag: achievement.tag.toLowerCase(),
      images: achievement.imageUrl ? [{ imageUrl: achievement.imageUrl }] : [],
    }));
  },
  ["achievements-list"],
  { tags: ["achievements"] }
);
