import prisma from "@/lib/prisma";
import { EventStatusType, EventType } from "@prisma/client";
import { unstable_cache } from "next/cache";

export interface RecruitmentStatus {
  isOpen: boolean;
  opensAt: Date | null;
  eventId: string | null;
}

const getRecruitmentEventStatus = unstable_cache(
  async (): Promise<RecruitmentStatus> => {
    const now = new Date();

    const drives = await prisma.event.findMany({
      where: {
        type: EventType.RECRUITMENT,
        status: { not: EventStatusType.CANCELED },
      },
      select: {
        id: true,
        status: true,
        startAt: true,
        registrationStart: true,
        registrationEnd: true,
      },
    });

    const isActive = (d: (typeof drives)[number]) => {
      if (d.registrationStart) {
        const started = now >= d.registrationStart;
        const notEnded = !d.registrationEnd || now <= d.registrationEnd;
        return started && notEnded;
      }
      return d.status === EventStatusType.ONGOING;
    };

    const active = drives.find(isActive);
    if (active) {
      return { isOpen: true, opensAt: null, eventId: active.id };
    }
    const next = drives
      .filter((d) => d.registrationStart && d.registrationStart > now)
      .sort(
        (a, b) =>
          a.registrationStart!.getTime() - b.registrationStart!.getTime()
      )[0];

    return {
      isOpen: false,
      opensAt: next?.registrationStart ?? next?.startAt ?? null,
      eventId: next?.id ?? null,
    };
  },
  ["recruitment-event-status"],
  { tags: ["events"], revalidate: 60 }
);

export default getRecruitmentEventStatus;
