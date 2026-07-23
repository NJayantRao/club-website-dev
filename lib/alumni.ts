import prisma from "@/lib/prisma";
import { MediaUsageType, Role } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getMediaUrlMap } from "@/lib/media";

export interface AlumniItem {
  id: string;
  name: string;
  role: string;
  designation: string | null;
  imageUrl: string | null;
}

export const getAlumni = unstable_cache(
  async (): Promise<AlumniItem[]> => {
    const alumni = await prisma.member.findMany({
      where: {
        role: Role.ALUMNI,
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
      alumni.map((member) => member.id)
    );

    return alumni.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      designation: member.designation,
      imageUrl: imageMap.get(member.id) ?? null,
    }));
  },
  ["alumni-list"],
  { tags: ["members"], revalidate: 86400 }
);
