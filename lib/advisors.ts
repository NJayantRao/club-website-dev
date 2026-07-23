import prisma from "@/lib/prisma";
import { MediaUsageType, Role } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getMediaUrlMap } from "@/lib/media";

export interface AdvisorItem {
  id: string;
  name: string;
  role: string;
  designation: string | null;
  imageUrl: string | null;
}

export const getAdvisors = unstable_cache(
  async (): Promise<AdvisorItem[]> => {
    const advisors = await prisma.member.findMany({
      where: {
        role: Role.ADVISOR,
      },
      select: {
        id: true,
        name: true,
        role: true,
        designation: true,
      },
    });

    const imageMap = await getMediaUrlMap(
      MediaUsageType.PROFILE,
      advisors.map((advisor) => advisor.id)
    );

    return advisors.map((advisor) => ({
      ...advisor,
      imageUrl: imageMap.get(advisor.id) ?? null,
    }));
  },
  ["advisors-list"],
  { tags: ["members"], revalidate: 86400 }
);
