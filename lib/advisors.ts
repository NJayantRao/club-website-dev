import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { unstable_cache } from "next/cache";

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
        imageUrl: true,
      },
    });

    return advisors;
  },
  ["advisors-list"],
  { tags: ["members"] }
);
