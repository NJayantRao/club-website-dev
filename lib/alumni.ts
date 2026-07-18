import prisma from "@/lib/prisma";
import { Role } from "@prisma/client";
import { unstable_cache } from "next/cache";

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
        imageUrl: true,
      },
    });

    return alumni.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      designation: member.designation,
      imageUrl: member.imageUrl,
    }));
  },
  ["alumni-list"],
  { tags: ["members"], revalidate: 86400 }
);
