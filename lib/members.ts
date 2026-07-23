import prisma from "@/lib/prisma";
import { MediaUsageType, Role } from "@prisma/client";
import { unstable_cache } from "next/cache";
import { getMediaUrlMap } from "@/lib/media";

export interface MemberItem {
  id: string;
  name: string;
  role: string;
  designation: string | null;
  imageUrl: string | null;
  link: string;
}

export const getMembers = unstable_cache(
  async (): Promise<MemberItem[]> => {
    const members = await prisma.member.findMany({
      where: {
        role: Role.MEMBER,
      },
      select: {
        id: true,
        name: true,
        role: true,
        designation: true,
        links: {
          where: {
            platform: "linkedin",
          },
          select: {
            id: true,
            platform: true,
            url: true,
          },
        },
      },
    });

    const imageMap = await getMediaUrlMap(
      MediaUsageType.PROFILE,
      members.map((member) => member.id)
    );

    return members.map((member) => ({
      id: member.id,
      name: member.name,
      role: member.role,
      designation: member.designation,
      imageUrl: imageMap.get(member.id) ?? null,
      link: member.links[0]?.url ?? "",
    }));
  },
  ["members-list"],
  { tags: ["members"], revalidate: 86400 }
);
